import { Node, InputEntry, IOptions, Parent } from './interfaces'
import { getDefaultOptions, parse, addEntry, createRoot, createNode } from './parser';
import find from 'unist-util-find'
import visitParents from 'unist-util-visit-parents'
import produce from 'immer'
export * from './interfaces'
export * from './parser'
export * from './transformers/distingish-files-and-folders'
export * from './transformers/merge-names'

export class Manager<T>
{
	private tree: Parent<T>;
	private activeNode: Node<T>;
	private options: IOptions<T>;

	private toFinal: ( tree: Parent<T> ) => Promise<Parent<T>>
	private toWorking: ( tree: Parent<T> ) => Promise<Parent<T>>

	constructor( options: Partial<IOptions<T>> = {}, toFinal: any[] = [], toWorking: any[] = [])
	{
		this.options = { ...getDefaultOptions(), ...options };
		
		this.toFinal = this.createPipeline( toFinal )
		this.toWorking = this.createPipeline( toWorking )

		this.tree = createRoot( this.options )
	}


	/**
	 * Returns a tree.
	 */
	getTree()
	{
		return this.tree
	}


	/**
	 * Builds tree from entries. Existing tree is replaced.
	 * @param entries 
	 */
	async setEntries( entries: InputEntry[] | string[] )
	{
		if ( entries.length === 0 )
		{
			this.tree = createRoot( this.options )
		}

		const tree = parse( entries, this.options );
		this.tree = await this.toFinal( tree );

		return this;
	}


	/**
	 * Adds entry to the tree. Costy - use setEntries, if you can.
	 * @param entry 
	 */
	async addEntry( entry: InputEntry )
	{
		this.tree = await produce( this.tree, async draft =>
		{
			const tree = await this.toWorking( draft as any );
			addEntry( tree as Parent<T>, entry, this.options )
			await this.toFinal( tree );
		})
		
		return this;
	}


	/**
	 * Sets current item as active. Active item cannot be closed.
	 * @param item 
	 */
	setActive( item: string | Node<T> )
	{
		this.open( item );

		const node = this.pathToNode( this.tree, item );
		this.activeNode = node;

		return this;
	}


	/**
	 * Returns active item.
	 */
	getActive(): Node<T> | undefined
	{
		return this.activeNode
	}


	/**
	 * Sets `data.isOpen` flag to true, if node can be opened.
	 * @param item 
	 */
	open( item: string | Node<T> ): Manager<T>
	{
		const x = this.tree;

		this.tree = produce( this.tree, draft =>
		{
			const node = this.pathToNode( draft, item );

			visitParents( draft as any, n => n === (node as any), visitor )
			
			function visitor( node, parents )
			{
				node.data.isOpen = true;
				parents.forEach( ( p: Node<T>) => p.data.isOpen = true );
			}
		})

		return this;
	}


	/**
	 * Returns `true` if node can be openend. By default all nodes can be opened.
	 * You can replace this method with your own implementation.
	 * @param item 
	 */
	canBeOpened( item: string | Node<T> ): boolean
	{
		return true;
	}


	/**
	 * Sets `data.isOpen` flag to false, if node can be closed.
	 * @param item 
	 */
	close( item: string | Node<T> ): Manager<T>
	{
		const node = this.pathToNode( this.tree, item );  
		if ( ! node ) return;

		this.tree = produce( this.tree, draft =>
		{
			const draftNode = this.pathToNode( draft, item );  

			if ( this.canBeClosed( node ) )
			{
				draftNode.data.isOpen = false;
			}
		})

		return this;
	}


	/**
	 * Returns `false` if node can be closed. By default all nodes except active node
	 * can be closed. You can replace this method with your own implementation.
	 * @param item 
	 */
	canBeClosed( item: string | Node<T> ): boolean
	{
		const node = this.pathToNode( this.tree, item );
		let result = true

		if ( node === this.activeNode )
		{
			return false;
		}
		
		visitParents( this.tree as any, n => n === (this.activeNode as any), visitor )
		
		function visitor( _node, parents )
		{
			const isParentOfActiveItem = parents.find( parent => parent === node )
			
			if ( isParentOfActiveItem )
			{
				result = false;
			}
		}

		return result;
	}


	/**
	 * Returns node for given path.
	 * @param path 
	 */
	getNodeByPath( path: string ): Node<T> | undefined
	{
		try
		{
			return this.pathToNode( this.tree, path );
		}

		catch (e)
		{
			return undefined;
		}
	}

	private pathToNode( tree, path: string | Node<T> ): Node<T>
	{
		if ( typeof path !== 'string')
		{
			path = path.data.chunks[0].fullPath
		} 

		const found = find( tree, ( x: Node<T> ) => x.data.chunks.find( ch => ch.fullPath === path ));
		if ( ! found ) throw new Error( `Node '${ path }' cannot be found.` );
		
		return found
	}

	private createPipeline( steps: any[] )
	{
		return async tree =>
		{
			for ( const step of steps )
			{
				const args = Array.isArray( step ) ? step : [step];
				const stepFn = args.shift();

				const run = await stepFn( ...args );
				tree = await run( tree );
			}

			return tree;
		}
	}
}