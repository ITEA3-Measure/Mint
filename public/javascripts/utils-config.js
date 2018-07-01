var projectInstances = [];
var instances = {};
// DOM Ready =============================================================
$(document).ready(function() {
    getProjectInstances();
});
// Configuration Functions =============================================================
$('button.edit-machine').click(function(e) {
    instances = {};
    var machineId = $(this).closest('tr').data('id');
    var analysis = analyses[machineId];
    var list = analysis.Instances;
    var modal = $('#editModal');
    modal.find('#machineName').val(analysis.name);
    modal.find('#machineDescription').val(analysis.description);
    modal.find('#machineRecommendation').val(analysis.customMessage);
    modal.find('#machineThreshold').val(analysis.customThreshold);
    modal.data('id', machineId);
    $("#instancesModalTable tbody").empty();
    for (var i = 0; i < list.length; i++) {
        var color = "";
        if(list[i].name == null || list[i].name == "" ) color = "table-danger";
        var id = "instanceDropDown"+list[i].id;
/*        $('#instancesModalTable tbody').append(
            '<tr data-id =' + list[i].id + ' class=' + color + '><td>'+ list[i].Measure.name +'</td><td>'
            +list[i].name+'</td></tr>');*/
        $('#instancesModalTable tbody').append(
            '<tr data-id =' + list[i].id + ' class=' + color + '><td>'+ list[i].Measure.name +'</td><td>'
            +'<select class="form-control" id='+id+'><option value="">-- Select --</option></select>'+'</td></tr>');
        var $dropdown = $('#'+id);
        $.each(projectInstances, function() {
            $dropdown.append($("<option />").val(this.instanceName).text(this.instanceName));
        });
        $dropdown.change(function () {
           var val = this.value;
           var id = this.closest('tr').getAttribute("data-id");
           instances[id] = val;
           if(val == "") {
               this.closest('tr').setAttribute('class','table-danger');
           } else {
               this.closest('tr').setAttribute('class','');
           }
        });
        if(list[i].name != null && list[i].name != "" ) {
            $dropdown.val(list[i].name);
        } else {
            $dropdown.val("");
        }

    }
});

$('#editModal').find('form').submit(function (e) {
    var modal = $('#editModal');
    var machineId = modal.data('id');
    /*    alert("Handler for .submit() called." + machineId);*/
    $.post('/configure/analysis/' + machineId,
        {
            name : modal.find('#machineName').val(),
            description : modal.find('#machineDescription').val(),
            customMessage : modal.find('#machineRecommendation').val(),
            customThreshold : modal.find('#machineThreshold').val(),
            instances: JSON.stringify(instances)
        }).done(function () {
        location.reload(true);
    //    done($('#editModal  .close').click());
    })
});


$('button.turn-off').click(function(e) {
    var machineId = $(this).closest('tr').data('id');
    $.post('/configure/analysis/' + machineId,
        {
            status : false
        });
    location.reload(true);
});

$('button.turn-on').click(function(e) {
    var machineId = $(this).closest('tr').data('id');
    var analysis = analyses[machineId];
    var list = analysis.Instances;
    for (var i = 0; i < list.length; i++) {
        if(list[i].name == "") {
            alert("Can't Activate machine. There's no instance of measure " + list[i].Measure.name);
            return;
        }
    }
    $.post('/configure/analysis/' + machineId,
        {
            status : true
        });
    location.reload(true);
});

function getProjectInstances() {
    $.get('/configure/instances/'+projectId, function(data, response) {
        projectInstances = data;
    }).fail(function () {
        console.log("fail");
    });
}

function showMore(id){
    document.getElementById(id+'Overflow').className='';
    document.getElementById(id+'MoreLink').className='hidden';
    document.getElementById(id+'LessLink').className='';
}

function showLess(id){
    document.getElementById(id+'Overflow').className='hidden';
    document.getElementById(id+'MoreLink').className='';
    document.getElementById(id+'LessLink').className='hidden';
}

var len = 100;
var shrinkables = document.getElementsByClassName('shrinkable');
if (shrinkables.length > 0) {
    for (var i = 0; i < shrinkables.length; i++){
        var fullText = shrinkables[i].innerHTML;
        if(fullText.length > len){
            var trunc = fullText.substring(0, len).replace(/\w+$/, '');
            var remainder = "";
            var id = shrinkables[i].id;
            remainder = fullText.substring(len, fullText.length);
            shrinkables[i].innerHTML = '<span>' + trunc + '<span class="hidden" id="' + id + 'Overflow">'+ remainder +'</span></span>&nbsp;<a id="' + id + 'MoreLink" href="#!" onclick="showMore(\''+ id + '\');">More</a><a class="hidden" href="#!" id="' + id + 'LessLink" onclick="showLess(\''+ id + '\');">Less</a>';
        }
    }
}