process.env.NODE_ENV = 'test';

var fetchwCache = require('./index.js'),
    chai = require('chai');

describe('Basic tests', function(){
  it('should get a json response', function(done){
    fetchwCache('https://jsonplaceholder.typicode.com/posts/1', {
      headers: { Accept: 'application/json' }
    })
    .then(function(res){
      if (res && res.id === 1) done();
    })
    .catch(function(err){
      done(err);
    });
  });

  it('should get a plain text response', function(done){
    fetchwCache('https://jsonplaceholder.typicode.com/posts?userId=1', {
      headers: { Accept: 'text/plain' }
    })
    .then(function(res){
      if (res && res.length === 2726) done();
      else console.log(res);
    })
    .catch(function(err){
      done(err);
    });
  });
});

describe('Caching tests', function(){
  var startTime;
  it('should cache a json response', function(done){
    fetchwCache('https://jsonplaceholder.typicode.com/photos', {
      headers: { Accept: 'application/json' }
    })
    .then(function(res){
      startTime = new Date().getTime();
      if (res && res['10361189088'] ==='Moreno, Victor'){
        return fetchwCache('https://jsonplaceholder.typicode.com/photos', {headers: { Accept: 'application/json' }})
      }
    })
    .then(function(res2){
      var endTime = new Date().getTime() - startTime;
      if (endTime < 10) 
        done();
      else 
        throw new Error('request appeared to not cache');
    })
    .catch(function(err){
      done(err);
    });
  });

  // it('should get a plain text response', function(done){
  //   fetchwCache('https://jsonplaceholder.typicode.com/posts/1', {
  //     headers: { Accept: 'text/plain' }
  //   })
  //   .then(function(res){
  //     if (res && res.length === 2726) done();
  //   })
  //   .catch(function(err){
  //     done(err);
  //   });
  // });
});
