import map from 'unist-util-map'
import { Node, Chunk, IOptions } from '../interfaces'

/**
 * Changes node type to `file` for nodes that match `isFile` and `folder` for those, that doesn't.
 * 
 * @param isFile - filter
 */
export function distingishFilesAndFolders<T = any>( options: IOptions<T>, isFile: ( chunk: Chunk<T> ) => boolean = ( chunk => chunk.name.indexOf( '.' ) > 0 )  )
{
	return ( tree )	=>
	{
		const next = map( tree, ( node: Node<T> ) =>
		{
			const chunks = node.data.chunks.map( ch => ({ ...ch, type: isFile( ch ) ? 'file': 'folder' }))
			const data = { ...node.data, chunks }

			return { ...node, data }
		})

		return next
	}
}