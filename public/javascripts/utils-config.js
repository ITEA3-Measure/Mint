// DOM Ready =============================================================
$(document).ready(function() {
    console.log("DOM READY");
});
// Configuration Functions =============================================================
$('button.edit-machine').click(function(e) {
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
        $('#instancesModalTable tbody').append(
            '<tr data-id =' + list[i].id +'><td>'+ list[i].Measure.name +'</td><td>'
            +list[i].name+'</td></tr>');

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
            customThreshold : modal.find('#machineThreshold').val()
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