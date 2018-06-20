// DOM Ready =============================================================
$(document).ready(function() {
    console.log("DOM READY");
});
// Configuration Functions =============================================================
$('button.edit-machine').click(function(e) {
    analyses = {};
    console.log("Editing machine");
    var machineId = $(this).closest('tr').data('id');
    console.log("id : " + machineId);
    var modal = $('#editModal');
    $.getJSON('/configure/analysis/' + machineId, function (data) {
        // set values in modal
        // console.log("data : " + data);
        modal.find('#machineName').val(data.name);
        modal.find('#machineDescription').val(data.description);
        modal.find('#machineRecommendation').val(data.customMessage);
        modal.find('#machineThreshold').val(data.customThreshold);
        modal.data('id', machineId);
        // modal.find('form').attr('action', '/configure/analysis/'+machineId);
        // open modal
        //  jQuery.noConflict();
        //  $('#editModal').modal();
    })
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
            customThreshold : modal.find('#machineThreshold').val()
        }).done($('#editModal  .close').click());
});

$('button.turn-off').click(function(e) {
    console.log("Turning off machine");
    var machineId = $(this).closest('tr').data('id');
    console.log("id : " + machineId);
    $.post('/configure/analysis/' + machineId,
        {
            status : false
        });
    location.reload(true);
});

$('button.turn-on').click(function(e) {
    console.log("Turning on machine");
    var machineId = $(this).closest('tr').data('id');
    console.log("id : " + machineId);
    $.post('/configure/analysis/' + machineId,
        {
            status : true
        });
    location.reload(true);
});

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