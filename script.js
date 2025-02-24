var all = document.getElementsByTagName("button");

for (var i=0, max=all.length; i < max; i++) {
    if(all[i].innerText == 'Connect'){
       all[i].click();
        
    }
     // Do something with the element here
}
