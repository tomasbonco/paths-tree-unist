// @ts-check
const {Manager} = require('../dist/node/index')
const util = require( 'util' )


const node = ( name, fullPath, children, isOpen = false, userData = {} ) =>
({
	type: 'node',
	data: { isOpen, chunks: [{ type: 'chunk', name, userData, fullPath }] },
	children
})

const root = ( name = '', fullPath = '', children = [], isOpen = false, userData = {} ) =>
({ ...node( name, fullPath, children, isOpen, userData ), type: 'root' })


it( 'empty tree should return root node', async () =>
{
	const manager = new Manager();
	expect( manager.getTree() ).toEqual( root() )
})


it( 'calling setEntries without values should reset the tree', async () =>
{
	const manager = new Manager();
	const entries = [ 'a', 'a/b' ];

	await manager.setEntries( entries );
	expect( manager.getTree().children ).toHaveLength( 1 );

	await manager.setEntries( [] );
	expect( manager.getTree().children ).toHaveLength( 0 );
})


it( 'should generate tree structure', async () =>
{
	const entries =
	[
		{ path: 'a/b/c/d.ts', data: { d: 5 } },
		{ path: 'a', data: { a: 10 } },
		{ path: 'x/y.ts', data: { x: 10 } },
		{ path: 'a/b/', data: { ya: 10 } },
	]

	const manager = new Manager();
	await manager.setEntries( entries );

	const expected = root( '', '',
	[
		node( 'a', 'a', [
			node( 'b','a/b', [
				node( 'c', 'a/b/c', [
					node( 'd.ts', 'a/b/c/d.ts', undefined, false, { d: 5 })
				], false )
			], false, { ya: 10 })
		], false, { a: 10 }),
		node( 'x', 'x', [
			node( 'y.ts', 'x/y.ts', undefined, false, { x: 10 } )
		], false )
	], false )

	expect( manager.getTree() ).toEqual( expected )
})


it( 'should generate tree sctructure from just array', async () =>
{
	const entries = [ 'a/b/c/d.ts', 'a', 'x/y.ts', 'a/b/' ];

	const manager = new Manager();
	await manager.setEntries( entries );

	const expected = root( '', '',
	[
		node( 'a', 'a', [
			node( 'b','a/b', [
				node( 'c', 'a/b/c', [
					node( 'd.ts', 'a/b/c/d.ts', undefined, false, {} )
				], false )
			], false, {} )
		], false, {} ),
		node( 'x', 'x', [
			node( 'y.ts', 'x/y.ts', undefined, false, {} )
		], false )
	], false )

	expect( manager.getTree() ).toEqual( expected )
})


it( 'if folder is part of active path, then it cannot be closed', async () =>
{
	const entries =
	[
		{ path: 'a/b/c/d.ts', data: { d: 5 } },
	]

	const pathsTree = new Manager();
	await pathsTree.setEntries( entries );
	pathsTree.setActive( 'a/b/c/d.ts' )
	pathsTree.close( 'a/b' );
	pathsTree.close( 'a/b/c/d.ts' );

	const expected = root( '', '',
	[
		node( 'a', 'a', [
			node( 'b','a/b', [
				node( 'c', 'a/b/c', [
					node( 'd.ts', 'a/b/c/d.ts', undefined, true, { d: 5 })
				], true )
			], true )
		], true )
	], true )

	expect( pathsTree.getTree() ).toEqual( expected )
})


it( 'closing the folder, should only close the folder', async () =>
{
	const entries =
	[
		{ path: 'a/b/c/d.ts', data: {} },
	]

	const manager = new Manager();
	await manager.setEntries( entries );

	manager.open( 'a/b/c/d.ts' )
	manager.close( 'a/b' );

	const expected = root( '', '',
	[
		node( 'a', 'a', [
			node( 'b','a/b', [
				node( 'c', 'a/b/c', [
					node( 'd.ts', 'a/b/c/d.ts', undefined, true )
				], true )
			], false )
		], true )
	], true )

	expect( manager.getTree() ).toEqual( expected )
})


it( 'calling getNodeByPath should return a node assigned to path', async () =>
{
	const entries = [ 'a', 'a/b', 'a/b/c' ]
	const manager = new Manager();
	await manager.setEntries( entries );

	const node = manager.getNodeByPath( 'a/b' )
	expect( node.data.chunks[0].fullPath ).toBe( 'a/b' );
})