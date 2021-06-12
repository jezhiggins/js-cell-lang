# Cell Elementary Learning Language

Cell is a minimally simple programming language designed to demonstrate how to write a programming language. 

Cell was designed by [Andy Balaam](http://www.artificialworlds.net/). His [original implementation is in Python](https://gitlab.com/cell_lang/cell). This repository is a new JavaScript implementation, written as the basis of a forthcoming talk to [the BrumJS Meetup](https://www.meetup.com/brum_js/), scheduled for September 2021. 

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

## Install

```
git clone https://gitlab.com/jezhiggins/jscell.git
cd jscell
npm install
./cell                  # - to run the interactive environment
./cell filename.cell    # - to run a program
npm run test            # - to run all the tests
```

## Work in Progress

This repository is work in progress

- [x] Lexer
- [x] Parser
- [x] Evaluator
- [x] Library
- [x] run file
- [ ] repl
- [ ] fun things to do with the AST
    - [ ] constant folding
    - [ ] obfuscation
    - [ ] pretty printing?
    - [ ] minification?
    - [ ] cross-compile to JS?
    - [ ] cross-compile to something else?

## See also

* [Video series about how to write a programming language](https://www.youtube.com/watch?v=TG0qRDrUPpA&list=PLgyU3jNA6VjT3FW83eHqryNcqd6fsvdrv)
* [Articles on how to write a programming language](https://github.com/andybalaam/articles-how-to-write-a-programming-language/) (now published in the [Overload](https://accu.org/index.php/journals/c78/) journal issues 145, 146 and 147).
* [My ACCU Conference talk about Cell](https://www.youtube.com/watch?v=82-XjMzKaC8)
* [Slides for the videos](https://github.com/andybalaam/videos-writing-cell)
* [datecalc](https://github.com/andybalaam/datecalc) - an even smaller language
