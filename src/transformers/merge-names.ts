import { Node, Parent, IOptions } from '../interfaces'
import visit from 'unist-util-visit'
import { createNode, insertNode } from '../parser';

/**
 * Changes node type to `file` for nodes that match `isFile` and `folder` for those, that doesn't.
 * 
 * @param isFile - filter
 */
export function mergeNames<T = any>( options: IOptions<T> )
{
	return ( tree )	=>
	{
		visit( tree, (node: Parent<T>) => node.children && node.children.length === 1 && node !== tree, visitor as any )
		
		function visitor( node: Parent<T>, index: number, parent: Parent<T> )
		{
			const child = node.children[0];

			if ( ! (child as Parent<T>).children || ( child as Parent<T> ).children.length === 0 )
			{
				return visit.CONTINUE;
			}

			child.data.chunks = [ ...node.data.chunks, ...child.data.chunks ]
			parent.children[ index ] = child;
	
			return [visit.SKIP, index]
		}

		return tree.children.length === 1 ? tree.children[ 0 ] : tree;
	}
}


export function unmergeNames<T = any>( options: IOptions<T> )
{
	return ( tree )	=>
	{
		visit( tree, (node: Node<T>) => node.data.chunks.length > 1, visitor as any )
		
		function visitor( node: Parent<T>, index: number, parent: Parent<T> )
		{
			const originalChunks = node.data.chunks;
			node.data.chunks = [ originalChunks[0] ];

			let _parent = node;

			for ( let i = 1; i < originalChunks.length; i++ )
			{
				const child = createNode( '', {}, options )
				child.data.chunks = [ originalChunks[i] ];

				insertNode( _parent, child, options );

				_parent = child as Parent<T>;
			}
		}

		return tree;
	}
}