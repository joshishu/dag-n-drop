/*global fabric*/
/*global bootstrap*/
const operators = [
    {name: 'GCS File Sensor', tag: 'GCSFileSensorOperator', opts: [{text: 'File Path', tag: 'gcsFilePath'}]}, 
    {name: 'Vertex Pipeline Job', tag: 'EtsyVertexAIPipelineJobOperator', opts: [{text: 'GCP Project', tag: 'gcpProjectID'}, {text: 'Vertex Pipeline Name', tag: 'vertexPipelineID'}]},
];

let activeTasks = [];
const tasks = []; // {name: string, operator: operator} list

const resizeCanvas = function(canvas){
    const dagArea = $('#dagarea')
    canvas.setDimensions({width: dagArea.width(), height: dagArea.height()});
};

const convertOptionsToHTML = function(options){
    return [{text: 'Task Name', tag: 'taskname'}].concat(options).
        map(({text, tag}) => {
            return `<div class="mb-3"><label for="${tag}" class="form-label">${text}</label><input type="text" class="form-control" id="${tag}" placeholder="${text}" data-dag-tag="lmao"></input></div>`;
        }).
        join('');
}

const handleClick = function(operator){
    $("div#namemodalcontent").html(convertOptionsToHTML(operator.opts));
    $("div#namemodal").data('operator', operator.name);
    const modal = new bootstrap.Modal('#namemodal');
    modal.show();
};

const handleModal = function(canvas){
    const operatorName = $('div#namemodal').data('operator');
    const operator = operators.find(operator => operator.name === operatorName);
    const taskName = $('input#taskname').val();
    const task = {name: taskName, operator, deps: []};
    task.opts = Object.fromEntries($("input[data-dag-tag='lmao']").toArray().map(node => [node.id, node.value]));
    const rect = new fabric.Rect({fill: 'red', width: 75, height: 50, originX: 'center', originY: 'center'});
    const text = new fabric.Text(taskName, {originX: 'center', originY: 'center'});
    const offset = (tasks.length % 5) * 10;
    const grp = new fabric.Group([rect, text], {
        left: offset,
        top: offset,
        width: 75,
        height: 50,
        selectable: true
    });
    canvas.add(grp);
    task.shape = grp;
    grp.my = {task};
    tasks.push(task);
    $('#namemodal').modal('hide');
    makeRepresentation();
};

const search = function(searchVal){
    const search = new RegExp(searchVal, 'i');
    const results = operators.
        filter(({name}) => search.test(name)).
        map((operator) => $(`<button class="btn btn-primary m-1">${operator.name}</button>`).on('click', () => handleClick(operator)));
    const btnGroup = $('<div class="btn-group-vertical" role="group"></div>');
    btnGroup.append(results);
    $("div#searchresults").
        empty().
        append(btnGroup);
};

const registerEventHandlers = function(canvas){
    const created = function(evt){
        activeTasks = [evt.selected[0]];
    };
    const updated = function(evt){
        activeTasks.push(evt.selected[0]);
        const start = activeTasks[activeTasks.length - 2];
        const end = activeTasks[activeTasks.length - 1];
        end.my.task.deps.push(start.my.task);
        const points = [start.left + start.width, start.top + (start.height / 2), end.left, end.top + (end.height / 2)];
        const line = new fabric.Line(points, {stroke: 'black'});
        canvas.add(line);
        makeRepresentation();
    };
    const cleared = function(){
        activeTasks = [];
    };
    canvas.on({
        'selection:created': created,
        'selection:updated': updated,
        'selection:cleared': cleared
    });
};

const makeRepresentation = function(){
    const body = tasks.map(task => ({name: task.name, operator: task.operator.tag, options: task.opts, dependencies: task.deps.map(({name}) => name)}));
    fetch('/convert', {method: 'post', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({tasks: body})}).
        then(response => response.text()).
        then((response) =>
            $("#output").text(response.split())
        );
};

$(function(){
    const canvas = new fabric.Canvas("dagcanvas");
    $("input#searchinput").on("input", function(){
        const rawSearchVal = $('input#searchinput').val();
        const searchVal = (rawSearchVal === null || rawSearchVal === undefined) ? '' : rawSearchVal.trim();
        search(searchVal, canvas);
    });
    $('button#namemodalsubmit').on("click", () => handleModal(canvas));
    search('', canvas);
    resizeCanvas(canvas);
    $(window).on('resize', () => resizeCanvas(canvas));
    registerEventHandlers(canvas);
});
