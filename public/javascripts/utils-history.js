// DOM Ready =============================================================
$(document).ready(function() {
    console.log("DOM READY");
    dataTable();
    addRowHandlers();
});
// Recommendations Functions =============================================================
function addRowHandlers() {
    var table = document.getElementById("recommendationTable");
    var rows = table.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        var currentRow = table.rows[i];
        var createClickHandler = function(row) {
            return function() {
                var id = row.getAttribute("data-id");
                console.log("data-id = " + id);
                if(id != null) {
                    console.log("recommendations[id] " + recommendations[id].message);
                    // alert("id:" + id);
                    var modal = $('#recommendationModal');
                    modal.find('#recommendationText').text(recommendations[id].message);
                    var table = $('#recommendationModalTable');
                    var list = recommendations[id].recommendations;
                    $("#recommendationModalTable tbody").empty();
                    for (var i = 0; i < list.length; i++) {
                        var color = "";
                        if(list[i].status == "New") color = "table-warning";
                        $('#recommendationModalTable tbody').append(
                            '<tr data-id =' + list[i].id + ' class=' + color + '><td>'+DateFormat.format.date(list[i].createdAt, "" +
                            "dd/MM/yyyy HH:mm:ss")+'</td><td>'
                            +list[i].status+'</td><td>'
                            +list[i].description+'</td></tr>');

                    }
                }
                rows = $('#recommendationModalTable tbody tr.table-warning');
                for(var i = 0; i < rows.length; i++) {
                    rows[i].onclick = markAsActive(rows[i]);
                }
            };
        };
        currentRow.onclick = createClickHandler(currentRow);
    }
}

function markAsActive(row) {
    return function () {
        console.log(" -- > marked as active " + row.getAttribute("data-id"));
        console.log(row);
        row.className="";
        row.onclick="";
        row.cells[1].innerText="Active";
        $.post('/history/recommendation/' + row.getAttribute("data-id"),
            {
                status : "Active"
            });
    }
}

function dataTable() {
    $('#recommendationTable').DataTable( {
        "order": [[ 0, 'desc' ]]
    } );
}