import * as Unist from 'unist'

export interface Node<T> extends Unist.Node
{
	data: Entry<T>
}

export interface Parent<T> extends Node<T>
{
	children: Node<T>[];
}

export interface Literal<T> extends Node<T>
{
	value: any;
}

export interface Entry<T> extends Unist.Data
{
	chunks: Chunk<T>[];
	isOpen: boolean;
}

export interface Chunk<T>
{
	type: string;
	name: string;
	fullPath: string;
	userData: T;
}

export type Comparator<T> = ( a: T, b: T ) => number;
export type Filter<T> = ( a: T, b: T ) => boolean;

export interface InputEntry
{
	path: string;
	data: any;
	type?: string;
}

export interface IOptions<T>
{
	delimiter: RegExp;
	defaultOpen: boolean;
	isDuplicate: Filter<Node<T>>;
}