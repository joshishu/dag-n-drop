/*global fabric*/
const operators = [
    {name: 'GCS File Sensor'}, 
    {name: 'Etsy Vertex Pipeline Operator'},
];

const tasks = []; // {name: string, operator: operator} list
const deps = []; // {start: task.name, end: task.name} list

const handleClick = function(operator, canvas){
    const task = {name:operator.name, operator: operators.find(({name}) => name === operator.name)};
    tasks.push(task);
    const rect = new fabric.Rect({fill: 'red'});
    const text = new fabric.Text(operator.name, {originX: 'center', originY: 'center'});
    const grp = new fabric.Group([rect, text], {
        left: 0,
        top: 0
    });
    canvas.add(grp);
};

$(function(){
    const canvas = new fabric.Canvas("dagcanvas");
    $("input#searchinput").on("input", function(){
        const rawSearchVal = $('input#searchinput').val();
        const searchVal = (rawSearchVal === null || rawSearchVal === undefined) ? '' : rawSearchVal.trim();
        if(searchVal === ''){
            $("div#searchresults").
                empty().
                removeClass('collapse.show').
                addClass('collapse');
            return;
        }
        const search = new RegExp(searchVal, 'i');
        const results = operators.
            filter(({name}) => search.test(name)).
            map((operator) => $(`<button class="btn btn-primary m-1">${operator.name}</button>`).on('click', () => handleClick(operator, canvas)));
        const btnGroup = $('<div class="btn-group-vertical" role="group"></div>');
        btnGroup.append(results);
        $("div#searchresults").
            empty().
            append(btnGroup).
            removeClass('collapse').
            addClass('collapse.show');
    });
});
