# Cell Elementary Learning Language

Cell is a minimally simple programming language designed to demonstrate how to write a programming language. 

Cell was designed by [Andy Balaam](http://www.artificialworlds.net/). His [original implementation is in Python](https://gitlab.com/cell_lang/cell). This repository is a new JavaScript implementation, written as the basis of a talk to [Norfolk Developers](https://www.meetup.com/Norfolk-Developers-NorDev/), scheduled for October 2021. 

Here is an example program:

```
square = {:(x) x * x;};

num1 = 3;
num2 = square( num1 );

if( equals( num1, num2 ),
    {
        print( "num1 equals num2." );
    },
    {
        print( "num1 does not equal num2." );
    }
);
```

This prints:

```
num1 does not equal num2.
```

## Build from Source

```
git clone https://gitlab.com/jezhiggins/jscell.git
cd jscell
npm install
./bin/cell.js             # - to run the interactive environment
./bin/cell filename.cell  # - to run a program
npm run test              # - to run all the tests
```

## Install from NPM

```
npm install cell-lang
```
or to run directly
```
npx cell-lang
```


## Work in Progress

This repository is work in progress

- [x] Lexer
- [x] Parser
- [x] Evaluator
- [x] Library
- [x] run file
- [x] repl (functional, but needs polish)
- [ ] fun things to do with the AST
    - [x] constant folding
    - [x] obfuscation
    - [x] AST pretty printing
    - [x] minification
    - [ ] cross-compile to JS?
    - [ ] cross-compile to something else?

## Design Principles

Cell is designed to be as complete a programming language as possible, while
also being as small to implement as possible.

The implementation is intended to be straightforward to follow,
since part of its purpose is to demonstrate how a program expressed in text 
becomes computer behaviour.

## Features

Cell has:

* Numbers (floating-point)
* Strings
* Functions
* A special "None" value

That's about it.

## Interacting with Cell

Cell has an interactive environment ("REPL") which can be launched by running
the Cell program with no arguments:

```
>>> 137 + 349;
486
>>> 5/10;
0.5
>>> 21 + 35 + 12 + 7;
75
>>> if(equals(0, 1), {"illogical";}, {"logical";});
'logical'
```

## How to write Cell programs

See the explanation of [Cell Syntax](./docs/syntax.md), and [The if function](./docs/if.md).

## Building a language

Cell does not provide special syntax for things like lists, maps and
objects, but they can be built up using the features of Cell functions.

The Cell library contains functions like `pair` that makes a simple data
structure from two values (more explanation at
[Data Structures](./docs/data_structures.md) ).

You can also build things that behave like objects in languages like Java and
C++ out of functions.  There is more explanation at: [Objects](./docs/objects.md).

## Explanations

Cell is designed to be useful to teach people how to write programming
languages, so the source code is intentionally short and hopefully reasonably
easy to read.  To get started, follow the links below for explanations of the
main parts.

In an interpreter, the program flows through several layers, starting off as
textual source code, and being transformed by each layer.

The first layer is the [Lexer](./docs/lexing.md), which reads in text characters, and
spits out "tokens" like `print`, or `{`.

The second layer is the [Parser](./docs/parsing.md), which reads in tokens, and spits
out tree-structures which it does not understand.

The third layer is the [Evaluator](./docs/evaluation.md), which reads in the tree
structures, understands them and "runs" them - turns them into concrete values
by looking up symbols, calling functions, and obeying rules (e.g. the rules of
arithmetic).

While the Evaluator is running, it has access to the [Library](./docs/library.md),
which is a set of standard values and functions that all programs can use.

## See also

* [Down to the Metal](https://www.jezuk.co.uk/blog/2021/10/down-to-the-metal.html), the talk I gave featuring this code.
* Andy's [video series about how to write a programming language](https://www.youtube.com/watch?v=TG0qRDrUPpA&list=PLgyU3jNA6VjT3FW83eHqryNcqd6fsvdrv)
* [Articles on how to write a programming language](https://github.com/andybalaam/articles-how-to-write-a-programming-language/), also published in the [Overload](https://accu.org/index.php/journals/c78/) journal issues 145, 146 and 147.
* [Andy's ACCU Conference talk about Cell](https://www.youtube.com/watch?v=82-XjMzKaC8)
* [Slides for the videos](https://github.com/andybalaam/videos-writing-cell)

## License

Copyright 2021 [JezUK Ltd](https://www.jezuk.co.uk/)
Licensed under the terms of the [MIT License](LICENSE).

