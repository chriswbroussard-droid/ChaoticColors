(() => {
  const signatureUrl = new URL('images/signature-black.png', document.baseURI).href;
  const tracked = new Map();
  const colors = new Map();
  let scheduled = false;
  const eligible = img => {
    const src = decodeURI(img.getAttribute('src') || '').toLowerCase();
    if (!src || /mockup|lobby|signature|signed|head shot|headshot|badge/.test(src)) return false;
    return src.includes('art catalog/') || src.includes('images/30 portfolio/') ||
      src.includes('images/palette-selections/') ||
      /by chris broussard|artwork|painting/.test((img.alt || '').toLowerCase()) ||
      ['lightbox-img', 'lightbox-image', 'placement-art'].includes(img.id);
  };
  function position(img, mark) {
    const box = img.getBoundingClientRect();
    if (!eligible(img) || !img.complete || !img.naturalWidth || box.width === 0 || box.height === 0) {
      mark.hidden = true; return;
    }
    const parent = img.parentElement;
    if (!parent || mark.parentElement !== parent) { mark.remove(); tracked.delete(img); return; }
    mark.hidden = false;
    const parentBox = parent.getBoundingClientRect();
    const style = getComputedStyle(img);
    let width = box.width, height = box.height;
    if (style.objectFit === 'contain' || style.objectFit === 'scale-down') {
      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
      width = img.naturalWidth * scale; height = img.naturalHeight * scale;
    }
    const signatureWidth = Math.min(width * .18, height * .525);
    const signatureHeight = signatureWidth * 364 / 1721;
    const inset = Math.min(width, height) * .025;
    mark.style.cssText = `position:absolute;pointer-events:none;z-index:2;background-image:url("${signatureUrl}");background-size:contain;background-repeat:no-repeat;width:${signatureWidth}px;height:${signatureHeight}px;left:${box.left-parentBox.left-parent.clientLeft+parent.scrollLeft+(box.width+width)/2-inset-signatureWidth}px;top:${box.top-parentBox.top-parent.clientTop+parent.scrollTop+(box.height+height)/2-inset-signatureHeight}px;`;
    const key = img.currentSrc || img.src;
    if (!colors.has(key)) {
      try {
        const canvas = document.createElement('canvas'); canvas.width = 24; canvas.height = 8;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        // Sample the visible lower-right area, including object-cover cropping.
        const scale = style.objectFit === 'cover' ? Math.max(box.width/img.naturalWidth,box.height/img.naturalHeight) : width/img.naturalWidth;
        const visibleWidth = style.objectFit === 'cover' ? box.width/scale : img.naturalWidth;
        const visibleHeight = style.objectFit === 'cover' ? box.height/scale : img.naturalHeight;
        const right = (img.naturalWidth+visibleWidth)/2;
        const bottom = (img.naturalHeight+visibleHeight)/2;
        const sw = signatureWidth/scale, sh = signatureHeight/scale;
        ctx.drawImage(img,right-inset/scale-sw,bottom-inset/scale-sh,sw,sh,0,0,24,8);
        const pixels = ctx.getImageData(0,0,24,8).data;
        let brightness = 0;
        for(let i=0;i<pixels.length;i+=4) brightness += .2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];
        colors.set(key,brightness/(24*8)<145);
      } catch { colors.set(key,true); }
    }
    mark.style.filter = colors.get(key) ? 'invert(1) drop-shadow(0 1px 1px rgba(0,0,0,.5))' : 'drop-shadow(0 1px 1px rgba(255,255,255,.4))';
  }
  function update() {
    scheduled = false;
    document.querySelectorAll('img').forEach(img => {
      if (!eligible(img) || tracked.has(img)) return;
      const parent = img.parentElement;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      const mark = document.createElement('span');
      mark.className = 'artwork-signature'; mark.setAttribute('aria-hidden','true');
      parent.appendChild(mark); tracked.set(img,mark);
      img.addEventListener('load',schedule); resize.observe(img); resize.observe(parent);
    });
    tracked.forEach((mark,img) => {
      if(!img.isConnected) {mark.remove();tracked.delete(img);resize.unobserve(img);}
      else position(img,mark);
    });
  }
  function schedule() { if(!scheduled) {scheduled=true;requestAnimationFrame(update);} }
  const resize = new ResizeObserver(schedule);
  new MutationObserver(records => { if(records.some(record => !record.target.classList?.contains("artwork-signature"))) schedule(); }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class','hidden']});
  window.addEventListener('resize',schedule);
  document.addEventListener('scroll',schedule,true);
  schedule();
})();
