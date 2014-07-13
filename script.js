// AJAX promising function thanks to http://www.html5rocks.com/en/tutorials/es6/promises/
function get(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
}



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
function unit_select(event) {
  var select = event.target,
      option = select.options[select.selectedIndex],

      column = get_column(2),
      name = option.innerText,
      cost = parseInt(option.getAttribute('data-cost'), 10) || 0,
      pmetal = parseInt(option.getAttribute('data-pmetal'), 10) || 0,
      penergy = parseInt(option.getAttribute('data-penergy'), 10) || 0,
      umetal = parseInt(option.getAttribute('data-umetal'), 10) || 0,
      uenergy = parseInt(option.getAttribute('data-uenergy'), 10) || 0;
  console.log(cost, pmetal, penergy, umetal, uenergy);

  var blocks = column.querySelectorAll('.block'),
      last = blocks[blocks.length - 1];

  if(last != undefined)
    t = ((parseInt(last.style.height, 10) + parseInt(last.style.top, 10)-1)/5);
  else
    t = 0

  add_unit(2, t, name, 30, cost, 0, (pmetal - umetal) || 0, (penergy - uenergy) || 0);
}

//JSON reader
function read_unit_json(response){
    var categories = JSON.parse(response),
        cats = document.querySelector('#categories'),
        cat_tpl = document.querySelector('#category'),
        unit_tpl = document.querySelector('#unit');

    for(var category in categories) {
      var clone = document.importNode(cat_tpl.content, true),
          units = categories[category];
      clone.querySelector('h2').innerText = category;
      clone.querySelector('select').addEventListener('change', unit_select);
      console.log(category);

      for(var i in units) {
        var unit_clone = document.importNode(unit_tpl.content, true),
            unit = units[i],
            a = unit_clone.querySelector('option');

        console.log(unit['display_name']);
        a.innerText = unit['display_name'];
        a.setAttribute('id', 'addunit-' + unit['display_name']);
        a.setAttribute('data-cost', unit['build_metal_cost']);
        if('production' in unit) {
          a.setAttribute('data-pmetal', unit['production']['metal']);
          a.setAttribute('data-penergy', unit['production']['energy']);
        }
        if('construction_demand' in unit) {
          a.setAttribute('data-umetal', unit['construction_demand']['metal']);
          a.setAttribute('data-uenergy', unit['construction_demand']['energy']);
        }
        clone.querySelector('.category select').appendChild(unit_clone);
      }
      cats.appendChild(clone);
    }
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

  get('units.json').then(read_unit_json, function(error) {
    console.error("Failed!", error);
  });

  document.querySelector('#add').addEventListener('click', function(  ){
    var form = document.querySelector('#form-add'),
        name = form.querySelector('#add-name').value,
        cost = form.querySelector('#add-cost').value,
        metal = form.querySelector('#add-metal').value,
        energy = form.querySelector('#add-energy').value,
        n_column = form.querySelector('#add-column').value,
        column = get_column(n_column);

    var blocks = column.querySelectorAll('.block'),
        last = blocks[blocks.length - 1];

    if(last != undefined)
      t = ((parseInt(last.style.height, 10) + parseInt(last.style.top, 10)-1)/5);
    else
      t = 0

    add_unit(n_column, t, name, 30, cost, 0, metal, energy);
  });
})
