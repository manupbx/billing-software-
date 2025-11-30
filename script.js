let currentInvoices = [];
    let itemCount = 1;
    let isLoading = false;
    let currentPage = 'invoices';
    
    // Load data from localStorage
    function loadInvoices() {
      const saved = localStorage.getItem('invoices');
      if (saved) {
        currentInvoices = JSON.parse(saved);
        renderInvoiceList();
        if (currentPage === 'analytics') {
          renderAnalytics();
        }
      }
    }
    
    // Save data to localStorage
    function saveInvoices() {
      localStorage.setItem('invoices', JSON.stringify(currentInvoices));
    }
    
    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const page = tab.dataset.page;
        switchPage(page);
      });
    });
    
    function switchPage(page) {
      currentPage = page;
      
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelector(`.nav-tab[data-page="${page}"]`).classList.add('active');
      
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`${page}-page`).classList.add('active');
      
      if (page === 'analytics') {
        renderAnalytics();
      }
    }
    
    function addItemRow() {
      const container = document.getElementById('items-container');
      const itemId = itemCount++;
      
      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.itemId = itemId;
      row.innerHTML = `
        <input type="text" class="item-input item-description" placeholder="Item description" required>
        <input type="number" class="item-input item-quantity" placeholder="Qty" min="1" value="1" required>
        <input type="number" class="item-input item-price" placeholder="Price" min="0" step="0.01" required>
        <button type="button" class="btn btn-danger btn-small remove-item-btn">Remove</button>
      `;
      
      container.appendChild(row);
      
      row.querySelector('.remove-item-btn').addEventListener('click', () => {
        row.remove();
        calculateTotals();
      });
      
      row.querySelectorAll('.item-quantity, .item-price').forEach(input => {
        input.addEventListener('input', calculateTotals);
      });
    }
    
    function calculateTotals() {
      const items = document.querySelectorAll('.item-row');
      let subtotal = 0;
      
      items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
      });
      
      const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;
      
      document.getElementById('subtotal-display').textContent = `$${subtotal.toFixed(2)}`;
      document.getElementById('tax-display').textContent = `$${taxAmount.toFixed(2)}`;
      document.getElementById('total-display').textContent = `$${total.toFixed(2)}`;
    }
    
    function generateInvoiceNumber() {
      const date = new Date();
      const timestamp = date.getTime();
      return `INV-${timestamp}`;
    }
    
    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast show' + (isError ? ' error' : '');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
    
    function printInvoice(invoice) {
      const printDiv = document.getElementById('print-invoice');
      const items = JSON.parse(invoice.items);
      
      printDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #000;">Your Business Name</h1>
            <p style="margin: 5px 0;">123 Business St, City, State</p>
            <p style="margin: 5px 0;">Phone: +1 (555) 123-4567</p>
            <p style="margin: 5px 0;">Email: info@yourbusiness.com</p>
          </div>
          
          <div style="border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 15px 0; margin-bottom: 20px;">
            <h2 style="margin: 0;">INVOICE</h2>
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 10px;">Bill To:</h3>
            <p style="margin: 5px 0;"><strong>${invoice.client_name}</strong></p>
            ${invoice.client_email ? `<p style="margin: 5px 0;">${invoice.client_email}</p>` : ''}
            ${invoice.client_phone ? `<p style="margin: 5px 0;">${invoice.client_phone}</p>` : ''}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${item.description}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Tax (${invoice.tax_rate}%):</strong> $${invoice.tax_amount.toFixed(2)}</p>
            <p style="margin: 10px 0; font-size: 20px;"><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
          </div>
          
          ${invoice.payment_method ? `<p style="margin: 10px 0;"><strong>Payment Method:</strong> ${invoice.payment_method}</p>` : ''}
          
          ${invoice.notes ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;"><strong>Notes:</strong></p>
              <p style="margin: 5px 0;">${invoice.notes}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            <p>Thank you for your business!</p>
          </div>
        </div>
      `;
      
      window.print();
      showToast('Print dialog opened');
    }
    
    function renderInvoiceList() {
      const container = document.getElementById('invoice-list');
      
      if (currentInvoices.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📄</div>
            <p>No invoices yet. Create your first invoice to get started!</p>
          </div>
        `;
        return;
      }
      
      const sortedInvoices = [...currentInvoices].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      container.innerHTML = sortedInvoices.map((invoice, index) => {
        const items = JSON.parse(invoice.items);
        const date = new Date(invoice.date).toLocaleDateString();
        
        return `
          <div class="invoice-item">
            <div class="invoice-header">
              <span class="invoice-number">${invoice.invoice_number}</span>
              <span class="invoice-status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
            </div>
            <div class="invoice-details">
              <strong>${invoice.client_name}</strong><br>
              ${invoice.client_email ? invoice.client_email + '<br>' : ''}
              ${invoice.client_phone ? invoice.client_phone + '<br>' : ''}
              Date: ${date}
            </div>
            ${invoice.payment_method ? `
              <div class="payment-info">
                <span class="payment-method">${invoice.payment_method}</span>
              </div>
            ` : ''}
            <div style="font-size: 14px; color: #a0a0a0; margin-top: 8px;">
              ${items.length} item(s)
            </div>
            <div class="invoice-total">Total: $${invoice.total.toFixed(2)}</div>
            <div class="invoice-actions">
              <button class="btn btn-secondary btn-small toggle-status-btn" data-index="${index}">
                Mark as ${invoice.status === 'pending' ? 'Paid' : 'Pending'}
              </button>
              <button class="btn btn-primary btn-small print-btn" data-index="${index}">Print Invoice</button>
              <button class="btn btn-danger btn-small delete-btn" data-index="${index}">Delete</button>
            </div>
          </div>
        `;
      }).join('');
      
      // Add event listeners
      container.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          toggleInvoiceStatus(sortedInvoices[index], index);
        });
      });
      
      container.querySelectorAll('.print-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          printInvoice(sortedInvoices[index]);
        });
      });
      
      container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          deleteInvoice(sortedInvoices[index]);
        });
      });
    }
    
    function toggleInvoiceStatus(invoice, index) {
      const invoiceIndex = currentInvoices.findIndex(inv => inv.invoice_number === invoice.invoice_number);
      if (invoiceIndex !== -1) {
        currentInvoices[invoiceIndex].status = currentInvoices[invoiceIndex].status === 'pending' ? 'paid' : 'pending';
        saveInvoices();
        renderInvoiceList();
        showToast(`Invoice marked as ${currentInvoices[invoiceIndex].status}`);
      }
    }
    
    function deleteInvoice(invoice) {
      const invoiceIndex = currentInvoices.findIndex(inv => inv.invoice_number === invoice.invoice_number);
      if (invoiceIndex !== -1) {
        currentInvoices.splice(invoiceIndex, 1);
        saveInvoices();
        renderInvoiceList();
        showToast('Invoice deleted successfully');
        
        if (currentPage === 'analytics') {
          renderAnalytics();
        }
      }
    }
    
    function renderAnalytics() {
      const totalInvoices = currentInvoices.length;
      const paidInvoices = currentInvoices.filter(inv => inv.status === 'paid').length;
      const pendingInvoices = currentInvoices.filter(inv => inv.status === 'pending').length;
      const totalRevenue = currentInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      document.getElementById('total-invoices-stat').textContent = totalInvoices;
      document.getElementById('total-revenue-stat').textContent = `$${totalRevenue.toFixed(2)}`;
      document.getElementById('paid-invoices-stat').textContent = paidInvoices;
      document.getElementById('pending-invoices-stat').textContent = pendingInvoices;
      
      renderRevenueChart();
      renderPaymentMethods();
      renderTopClients();
    }
    
    function renderRevenueChart() {
      const chartContainer = document.getElementById('revenue-chart');
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          month: date.getMonth(),
          revenue: 0
        });
      }
      
      currentInvoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const monthData = months.find(m => 
          m.year === invoiceDate.getFullYear() && 
          m.month === invoiceDate.getMonth()
        );
        if (monthData) {
          monthData.revenue += invoice.total;
        }
      });
      
      const maxRevenue = Math.max(...months.map(m => m.revenue), 100);
      
      chartContainer.innerHTML = months.map(month => {
        const height = (month.revenue / maxRevenue) * 100;
        return `
          <div class="bar" style="height: ${height}%;">
            <div class="bar-value">$${month.revenue.toFixed(0)}</div>
            <div class="bar-label">${month.name}</div>
          </div>
        `;
      }).join('');
    }
    
    function renderPaymentMethods() {
      const paymentMethodsContainer = document.getElementById('payment-methods-list');
      const paymentMethodCounts = {};
      
      currentInvoices.forEach(invoice => {
        const method = invoice.payment_method || 'Not specified';
        paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
      });
      
      const sortedMethods = Object.entries(paymentMethodCounts)
        .sort((a, b) => b[1] - a[1]);
      
      if (sortedMethods.length === 0) {
        paymentMethodsContainer.innerHTML = '<div class="empty-state" style="padding: 20px;">No payment data available</div>';
        return;
      }
      
      paymentMethodsContainer.innerHTML = sortedMethods.map(([method, count]) => `
        <div class="payment-method-item">
          <span class="payment-method-name">${method}</span>
          <span class="payment-method-count">${count} invoice${count !== 1 ? 's' : ''}</span>
        </div>
      `).join('');
    }
    
    function renderTopClients() {
      const topClientsContainer = document.getElementById('top-clients-list');
      const clientData = {};
      
      currentInvoices.forEach(invoice => {
        if (!clientData[invoice.client_name]) {
          clientData[invoice.client_name] = {
            total: 0,
            count: 0
          };
        }
        clientData[invoice.client_name].total += invoice.total;
        clientData[invoice.client_name].count += 1;
      });
      
      const sortedClients = Object.entries(clientData)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5);
      
      if (sortedClients.length === 0) {
        topClientsContainer.innerHTML = '<div class="empty-state" style="padding: 20px;">No client data available</div>';
        return;
      }
      
      topClientsContainer.innerHTML = sortedClients.map(([name, data]) => `
        <div class="payment-method-item">
          <div>
            <div class="payment-method-name">${name}</div>
            <div style="font-size: 12px; color: #a0a0a0; margin-top: 4px;">${data.count} invoice${data.count !== 1 ? 's' : ''}</div>
          </div>
          <span class="payment-method-name">$${data.total.toFixed(2)}</span>
        </div>
      `).join('');
    }
    
    document.getElementById('invoice-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (isLoading) return;
      
      const items = [];
      document.querySelectorAll('.item-row').forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        
        if (description && quantity && price) {
          items.push({ description, quantity, price, total: quantity * price });
        }
      });
      
      if (items.length === 0) {
        showToast('Please add at least one item', true);
        return;
      }
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;
      
      const invoiceData = {
        invoice_number: generateInvoiceNumber(),
        client_name: document.getElementById('client-name').value,
        client_email: document.getElementById('client-email').value,
        client_phone: document.getElementById('client-phone').value,
        items: JSON.stringify(items),
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
        date: document.getElementById('invoice-date').value,
        status: 'pending',
        payment_method: document.getElementById('payment-method').value,
        notes: document.getElementById('notes').value
      };
      
      currentInvoices.push(invoiceData);
      saveInvoices();
      renderInvoiceList();
      
      showToast('Invoice created successfully!');
      document.getElementById('invoice-form').reset();
      document.getElementById('items-container').innerHTML = '';
      itemCount = 1;
      addItemRow();
      
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('invoice-date').value = today;
      document.getElementById('tax-rate').value = 10;
      
      calculateTotals();
    });
    
    document.getElementById('add-item-btn').addEventListener('click', addItemRow);
    document.getElementById('tax-rate').addEventListener('input', calculateTotals);
    
    function init() {
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('invoice-date').value = today;
      
      addItemRow();
      loadInvoices();
    }
    
    init();