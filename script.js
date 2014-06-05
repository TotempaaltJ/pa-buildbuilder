var TOTAL_SECONDS = 0;
var TOTAL_COLUMNS = 0;

function add_seconds(n) {
  var tpl = document.querySelector('#build-second'),
      time = document.querySelector('#time');

  for(i = 0; i < n; i++) {
    var clone = document.importNode(tpl.content, true);
    clone.querySelector('.second').setAttribute('data-n', TOTAL_SECONDS);
    time.appendChild(clone);

    TOTAL_SECONDS += 1;
  }
}
function add_column(id) {
  var tpl = document.querySelector('#column'),
      columns = document.querySelector('#columns'),
      clone = document.importNode(tpl.content, true),
      column = clone.querySelector('.column');

  if(id != undefined)
    column.setAttribute('id', id);
  column.setAttribute('data-n', TOTAL_COLUMNS);

  columns.appendChild(clone);
  TOTAL_COLUMNS += 1;
  return column;
}
function get_column(n) {
  var column = document.querySelector('.column[data-n="' + n + '"]');
  return column;
}

function add_block(column, t) {
  var tpl = document.querySelector('#block'),
      column = get_column(column),
      blocks = column.querySelector('.blocks'),
      clone = document.importNode(tpl.content, true);

  var block = clone.querySelector('.block');
  block.style.top = t*5 + 'px';
  blocks.appendChild(clone);
  return block;
}
function populate_unit(name, metal, energy) {
  var tpl = document.querySelector('#block-unit'),
      clone = document.importNode(tpl.content, true);

  clone.querySelector('.name').innerText = name;
  clone.querySelector('.metal').innerText = metal;
  clone.querySelector('.energy').innerText = energy;

  return clone
}
function add_unit(column, t, name, with_bp, cost, bp, metal, energy) {
  var block = add_block(column, t),
      unit = populate_unit(name, metal, energy),
      duration = (cost/with_bp);

  block.appendChild(unit);

  block.style.height = duration*5+1 + 'px';
  block.appendChild(unit);

  if((t + duration) > TOTAL_SECONDS)
    add_seconds((t + duration) - TOTAL_SECONDS + 1);
}

document.addEventListener('DOMContentLoaded',function(){
  add_seconds(1);

  var metal = add_column('metal');
  metal.querySelector('h1').innerText = '1,000+10';

  var energy = add_column('energy');
  energy.querySelector('h1').innerText = '20,000+1,000';

  var column = add_column(),
      unit = populate_unit('Commander', -30, -1500);
  column.querySelector('h1').appendChild(unit);

  add_unit(2, 0, 'extractor', 30, 150, 0, 7, 0);
  add_unit(2, 5, 'extractor', 30, 150, 0, 7, 0);

  document.querySelector('#add').addEventListener('click', function(  ){
    var form = document.querySelector('#form-add'),
        name = form.querySelector('#add-name').value,
        cost = form.querySelector('#add-cost').value,
        metal = form.querySelector('#add-metal').value,
        energy = form.querySelector('#add-energy').value,
        n_column = form.querySelector('#add-column').value,
        column = get_column(n_column);

    var blocks = column.querySelectorAll('.block'),
        last = blocks[blocks.length - 1],
        t = ((parseInt(last.style.height, 10) + parseInt(last.style.top, 10)-1)/5);

    add_unit(n_column, t, name, 30, cost, 0, metal, energy);
  });
})
