$(function() {
  function loadPrinters() {
    $.getJSON('/api/printers', function(data) {
      const tbody = $('#printers-table tbody');
      tbody.empty();
      data.forEach(p => {
        tbody.append(`<tr>
          <td>${p.ip}</td>
          <td>${p.description || ''}</td>
          <td>${p.status}</td>
          <td>${p.toner_percent ?? 'N/A'}</td>
          <td><button class="btn btn-sm btn-danger" data-id="${p.id}">Delete</button></td>
        </tr>`);
      });
    });
  }

  $('#refresh-btn').on('click', loadPrinters);
  loadPrinters();

  $('#printers-table').on('click', 'button.btn-danger', function() {
    const id = $(this).data('id');
    $.ajax({url: `/api/printers/${id}`, type: 'DELETE'}).done(loadPrinters);
  });
});