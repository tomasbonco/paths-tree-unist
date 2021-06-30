import { Parent, Node, InputEntry, IOptions } from "./interfaces"

export function getDefaultOptions(): IOptions<unknown>
{
	return {
		delimiter: /[\/\\\\]/g,
		defaultOpen: false,
		isDuplicate: ( a: Node<unknown>, b: Node<unknown> ) => a.data.chunks[0].fullPath === b.data.chunks[0].fullPath
	}
}


export function parse<T>( entries: InputEntry[] | string[], userOptions?: IOptions<T> )
{

	const options = { ...getDefaultOptions(), ...userOptions }
	const rootNode: Parent<T> = createRoot( options )

	const unified: InputEntry[] = typeof entries[0] === 'string' ? pathsToInputEntries( entries as string[] ) : entries as InputEntry[];

	for ( const entry of unified )
	{
		addEntry( rootNode as Parent<T>, entry, options )
	}

	return rootNode;
}


export function addEntry<T>( parentNode: Parent<T>, entry: InputEntry, options: IOptions<T> )
{
	const parts = entry.path.split( options.delimiter );
	let parent: Parent<T> = parentNode;
	let path = parent.data.chunks[0].fullPath;

	for ( const part of parts )
	{
		if ( ! part ) { break; }
		path = path ? [ path, part ].join( '/' ) : part;

		const node = createNode( path, {}, options, entry.type );
		parent = insertNode( parent, node, options ) as Parent<T>;
	}

	parent.data.chunks[0].userData = { ...( parent.data.chunks[0].userData || {} ), ...( entry.data || {} ) };
}


export function createNode<T>( path: string, data: any, options: IOptions<T>, type: string = 'node' ): Node<T>
{
	return {
		type,
		data:
		{
			isOpen: options.defaultOpen,
			chunks:
			[{
				type: 'chunk',
				name: path.split( options.delimiter ).pop(),
				fullPath: path,
				userData: data
			}]
			
		}
	}
}


export function createRoot<T>( options ): Parent<T>
{
	return { ...createNode( '', {}, options, 'root' ), children: [] }
}


export function insertNode<T>( parentNode: Parent<T>, node: Node<T>, options: IOptions<T> ): Node<T>
{
	const existing = parentNode.children && parentNode.children.find( child => options.isDuplicate( node, child ) )
	
	if ( existing )
	{
		return existing;
	}

	const children = [ ...(parentNode.children || []), node ]
	parentNode.children = children;

	return node;
}

function pathsToInputEntries( entries: string[] ): InputEntry[]
{
	return entries.map( path => ({ path, data: {}, type: 'node' }) );
}