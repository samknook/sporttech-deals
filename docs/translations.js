/* TriZentro static translation bundles: no external translation APIs. */
(function(root){
'use strict';
const bundles={common:{nl:{},en:{}},pageTitles:{}};
function add(page,source,pairs){
 const destination=source==='nl'?'en':'nl';
 if(!bundles[page])bundles[page]={nl:{},en:{}};
 for(const pair of pairs)bundles[page][destination][pair[0]]=pair[1];
}
function both(pairs){
 for(const [nl,en] of pairs){bundles.common.en[nl]=en;bundles.common.nl[en]=nl;}
}
root.TriZentroTranslations=bundles;
root.TriZentroAddTranslations=add;
root.TriZentroCommonTranslations=both;
})(window);
