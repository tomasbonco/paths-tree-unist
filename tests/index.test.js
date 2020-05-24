// @ts-check
const {Manager} = require('../dist/node/index')
const util = require( 'util' )


const node = ( name, fullPath, children, isOpen = false, userData = {} ) =>
({
	type: 'node',
	data: { isOpen, chunks: [{ type: 'chunk', name, userData, fullPath }] },
	children
})

it( 'should generate tree sctructure', async () =>
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

	const expected = node( '', '',
	[
		node( 'a', '/a', [
			node( 'b','/a/b', [
				node( 'c', '/a/b/c', [
					node( 'd.ts', '/a/b/c/d.ts', undefined, false, { d: 5 })
				], false )
			], false, { ya: 10 })
		], false, { a: 10 }),
		node( 'x', '/x', [
			node( 'y.ts', '/x/y.ts', undefined, false, { x: 10 } )
		], false )
	], false )

	expect( manager.getTree() ).toEqual( expected )
})


it( 'should generate tree sctructure from just array', async () =>
{
	const entries = [ 'a/b/c/d.ts', 'a', 'x/y.ts', 'a/b/' ];

	const manager = new Manager();
	await manager.setEntries( entries );

	const expected = node( '', '',
	[
		node( 'a', '/a', [
			node( 'b','/a/b', [
				node( 'c', '/a/b/c', [
					node( 'd.ts', '/a/b/c/d.ts', undefined, false, {} )
				], false )
			], false, {} )
		], false, {} ),
		node( 'x', '/x', [
			node( 'y.ts', '/x/y.ts', undefined, false, {} )
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
	pathsTree.setActive( '/a/b/c/d.ts' )
	pathsTree.close( '/a/b' );
	pathsTree.close( '/a/b/c/d.ts' );

	const expected = node( '', '',
	[
		node( 'a', '/a',
		[
			node( 'b','/a/b', [
				node( 'c', '/a/b/c', [
					node( 'd.ts', '/a/b/c/d.ts', undefined, true, { d: 5 })
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

	manager.open( '/a/b/c/d.ts' )
	manager.close( '/a/b' );

	const expected = node( '', '',
	[
		node( 'a', '/a', [
			node( 'b','/a/b', [
				node( 'c', '/a/b/c', [
					node( 'd.ts', '/a/b/c/d.ts', undefined, true )
				], true )
			], false )
		], true )
	], true )

	expect( manager.getTree() ).toEqual( expected )
})