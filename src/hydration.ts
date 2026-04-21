export function getA11yHydrationScript(storageKey = "a11y-toolbar", defaultFontSize = 1): string {
  return `(function(){function c2k(s){return s.replace(/([A-Z])/g,function(m){return '-'+m.toLowerCase()})}try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)}));if(s&&s.settings){var h=document.documentElement;Object.keys(s.settings).forEach(function(k){if(s.settings[k])h.setAttribute('data-a11y-'+c2k(k),'')});if(s.fontSize&&s.fontSize!==${defaultFontSize})h.style.fontSize=s.fontSize*100+'%'}}catch(e){}})()`;
}
