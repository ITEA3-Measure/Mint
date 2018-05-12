// DOM Ready =============================================================
$(document).ready(function() {
    console.log("DOM READY");
    addRowHandlers();
    dataTable();
});
// Configuration Functions =============================================================
$('button.edit-machine').click(function(e) {
   console.log("Editing machine");
   var machineId = $(this).data('id');
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
    var machineId = $(this).data('id');
    console.log("id : " + machineId);
    $.post('/configure/analysis/' + machineId,
        {
            status : false
        });
});

$('button.turn-on').click(function(e) {
    console.log("Turning on machine");
    var machineId = $(this).data('id');
    console.log("id : " + machineId);
    $.post('/configure/analysis/' + machineId,
        {
            status : true
        });
});

// Recommendations Functions =============================================================
function addRowHandlers() {
    var table = document.getElementById("recommendationTable");
    var rows = table.getElementsByTagName("tr");
    for (i = 0; i < rows.length; i++) {
        var currentRow = table.rows[i];
        var createClickHandler = function(row) {
            return function() {
                var id = row.getAttribute("data-id");
                if(id != null) {
                    console.log("recommendations[id] " + recommendations[id].message);
                    // alert("id:" + id);
                    var modal = $('#recommendationModal');
                    modal.find('#recommendationText').text(recommendations[id].message);
                    var table = $('#recommendationModalTable');
                    var list = recommendations[id].recommendations;
                    $("#recommendationModalTable tbody").empty();
                    for (var i = 0; i < list.length; i++) {
                        $('#recommendationModalTable tbody').append('<tr><td>'+list[i].createdAt+'</td><td>'+list[i].status+'</td><td>'+list[i].message+'</td></tr>');
                    }
                }
            };
        };
        currentRow.onclick = createClickHandler(currentRow);
    }
}

function dataTable() {
    $('#recommendationTable').DataTable();
}