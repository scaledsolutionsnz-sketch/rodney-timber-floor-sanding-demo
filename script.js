var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile menu (Escape closes and returns focus; opened from the keyboard, focus moves to the first link)
var burger=document.getElementById('burger'),links=document.getElementById('navLinks');
if(burger){
  burger.addEventListener('click',function(e){var o=links.classList.toggle('open');burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Close menu':'Open menu');if(o&&e.detail===0){var first=links.querySelector('a');if(first)first.focus();}});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&links.classList.contains('open')){links.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');burger.focus();}});
}

// Nav shadow on scroll + parallax band
var nav=document.getElementById('nav'),pbg=document.getElementById('parallaxBg'),ticking=false;
function onScroll(){
  if(nav)nav.classList.toggle('scrolled',window.scrollY>40);
  if(!reduce&&pbg){var r=pbg.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){pbg.style.transform='translate3d(0,'+((r.top-innerHeight/2)*-0.16)+'px,0)';}}
  ticking=false;
}
window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(onScroll);ticking=true;}},{passive:true});
onScroll();

// Hero Ken Burns crossfade with pause/play
// Slides 2 to 4 only download after the page has loaded, so they never hold up the first photo
var hero=document.querySelector('.hero'),slides=document.querySelectorAll('#heroSlides img'),dots=document.querySelectorAll('#dots span'),toggle=document.getElementById('slideToggle'),cur=0,timer=null,paused=false,slidesQueued=false;
function loadSlides(){
  if(slidesQueued)return;slidesQueued=true;
  function go(){slides.forEach(function(img){var s=img.getAttribute('data-srcset');if(s){img.srcset=s;img.src=img.getAttribute('data-src');}});}
  if(document.readyState==='complete')go();else window.addEventListener('load',go);
}
function next(){
  var n=(cur+1)%slides.length;
  if(!(slides[n].complete&&slides[n].naturalWidth))return; // next photo still downloading: keep this one up and try again next turn
  slides[cur].classList.remove('active');if(dots[cur])dots[cur].classList.remove('on');
  cur=n;
  void slides[cur].offsetWidth;
  slides[cur].classList.add('active');if(dots[cur])dots[cur].classList.add('on');
}
function start(){loadSlides();if(!timer&&slides.length>1)timer=setInterval(next,6000);}
function stop(){clearInterval(timer);timer=null;}
function setPaused(p){
  paused=p;if(hero)hero.classList.toggle('paused',p);
  if(toggle)toggle.setAttribute('aria-pressed',p); // label stays "Pause slideshow"; aria-pressed carries the state
  if(p)stop();else start();
}
if(slides.length){
  if(reduce)setPaused(true);else start();
  if(toggle)toggle.addEventListener('click',function(){setPaused(!paused);});
}

// Count-up
function countUp(el){
  var end=+el.getAttribute('data-count');
  if(reduce){el.textContent=end;return;}
  var t0=null;
  function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/1500,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);}
  el.textContent='0';requestAnimationFrame(step);
}

// Scroll reveals, staggered within each parent
var targets=document.querySelectorAll('.reveal,.wipe,.wipe-up');
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      var el=e.target,sibs=Array.prototype.filter.call(el.parentElement.children,function(c){return c.matches('.reveal,.wipe,.wipe-up');});
      var d=(Math.max(0,sibs.indexOf(el))*0.1)+'s',img=el.querySelector(':scope>img');
      if(img){img.style.transitionDelay=d+',0s';img.addEventListener('transitionend',function(){img.style.transitionDelay='';},{once:true});}
      else{el.style.transitionDelay=d;}
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(el);
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  targets.forEach(function(el){io.observe(el);});
}else{
  targets.forEach(function(el){el.classList.add('in');});
}

// Click-to-play Facebook videos (iframe only loads when tapped)
document.querySelectorAll('.video-cover').forEach(function(btn){
  btn.addEventListener('click',function(e){
    var f=document.createElement('iframe');
    f.src='https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(btn.getAttribute('data-video'))+'&show_text=false&width=360&autoplay=true';
    f.title=btn.getAttribute('data-title');
    f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; web-share');
    f.setAttribute('allowfullscreen','');
    f.setAttribute('scrolling','no');
    btn.replaceWith(f);
    if(e.detail===0)f.focus(); // opened from the keyboard: keep focus on the video
  });
});

var yr=document.getElementById('year');if(yr)yr.textContent=new Date().getFullYear();
