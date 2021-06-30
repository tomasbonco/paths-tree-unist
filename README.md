# paths-tree-unist

I made this package, because I've seen a few solutions but none of them was universal enough. So this:
* uses [unist](https://github.com/syntax-tree/unist) tree data structure (so you can use unist tools to traverse/modify it),
* a node can contain multiple segments of the path,
* allows to store custom data for any segment of the path,
* has advanced logic for opening/closing the folders,
* ES6 compatible module (provides also version for node).

So whether you are creating a simple tree representation, or VS Code's like advanced file browser this should help you a lot.

## Parser

Can be used with as unist parser.

## Manager

Class providing everything most user will need.

Currently under development/testing. Pretty stable. Currently, please check the unit tests to see how to use it.