library on top of Web Audio API.
It is a direct adaptation of
[tQuery.Webaudio](http://learningthreejs.com/blog/2012/03/20/sounds-for-more-realistic-3d/).

## Examples

* [minimal](http://jeromeetienne.github.com/webaudio.js/examples/)
* [Sample use with tQuery](http://jeromeetienne.github.com/webaudio.js/examples/sample-tquery.html)
* [Playground with tQuery](http://jeromeetienne.github.com/webaudio.js/examples/playground/)

## Basic examples

```javascript
// init the library
var webaudio = new WebAudio();
// create a sound
var sound = webaudio.createSound();
// load sound.wav and play it
sound.load('sound.wav', function(sound){
    sound.play();
});
```