// DOM Ready =============================================================
$(document).ready(function() {
    console.log("DOM READY");
    console.log(analyses);
    console.log(JSON.parse(analyses));
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
            recommendation : modal.find('#machineRecommendation').val(),
            threshold : modal.find('#machineThreshold').val()
        }).done($('.modal.in').modal('hide'));
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