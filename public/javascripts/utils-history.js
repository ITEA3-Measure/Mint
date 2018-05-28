// DOM Ready =============================================================
$(document).ready(function() {
    console.log("DOM READY");
    addRowHandlers();
    dataTable();
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
                        $('#recommendationModalTable tbody').append(
                            '<tr><td>'+DateFormat.format.date(list[i].createdAt, "" +
                            "dd/MM/yyyy HH:mm:ss")+'</td><td>'
                            +list[i].status+'</td><td>'
                            +list[i].description+'</td></tr>');
                    }
                }
            };
        };
        currentRow.onclick = createClickHandler(currentRow);
    }
}

function dataTable() {
    $('#recommendationTable').DataTable( {
        "order": [[ 0, 'asc' ]]
    } );
}