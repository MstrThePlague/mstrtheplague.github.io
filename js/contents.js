// "On this page": lists an article's sections from its own h2s, so it never drifts out of step.
// Each h2 in the article needs an id. Without JavaScript the list simply stays hidden.
(function () {
  var toc = document.querySelector('.toc');
  if (!toc) return;
  var list = toc.querySelector('ul');
  var headings = document.querySelectorAll('.prose h2[id]');
  if (!headings.length) return;

  Array.prototype.forEach.call(headings, function (h) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });
  toc.hidden = false;
})();
