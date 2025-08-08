// QSell Lead Manager Application
class QSellLeadManager {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('qsell_leads')) || [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingLeadId = null;
        this.filters = {
            status: 'all',
            marketplace: '',
            priority: '',
            category: '',
            minValue: '',
            maxValue: '',
            dateFrom: '',
            dateTo: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderLeads();
        this.updateStats();
        this.addSampleData();
        this.updateLeadsCount();
        this.initCalculator();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.status);
            });
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.setSearch(e.target.value);
        });

        // Lead form
        document.getElementById('leadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLead();
        });

        // Status options
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.changeLeadStatus(e.target.closest('.status-option').dataset.status);
            });
        });

        // Advanced filters
        document.getElementById('marketplaceFilter').addEventListener('change', (e) => {
            this.filters.marketplace = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.applyFilters();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('minValue').addEventListener('input', (e) => {
            this.filters.minValue = e.target.value;
        });

        document.getElementById('maxValue').addEventListener('input', (e) => {
            this.filters.maxValue = e.target.value;
        });

        document.getElementById('dateFrom').addEventListener('change', (e) => {
            this.filters.dateFrom = e.target.value;
        });

        document.getElementById('dateTo').addEventListener('change', (e) => {
            this.filters.dateTo = e.target.value;
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Calculator event listeners
        document.getElementById('itemsCount').addEventListener('input', () => this.updateCalculator());
        document.getElementById('adsPlatform').addEventListener('change', () => this.updateCalculator());
        document.getElementById('deploymentPlatform').addEventListener('change', () => this.updateCalculator());
        document.getElementById('deploymentProducts').addEventListener('input', () => this.updateCalculator());
    }

    addSampleData() {
        if (this.leads.length === 0) {
            const sampleLeads = [
                {
                    id: 1,
                    name: 'Jan Kowalski',
                    company: 'TechCorp Sp. z o.o.',
                    phone: '+48 123 456 789',
                    email: 'jan.kowalski@techcorp.pl',
                    marketplace: 'Allegro',
                    category: 'sales',
                    priority: 'high',
                    estimatedValue: 5000,
                    status: 'new',
                    notes: 'Interesuje się integracją z Basellinker',
                    nextAction: 'Zadzwonić za 2 dni',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Anna Nowak',
                    company: 'E-commerce Solutions',
                    phone: '+48 987 654 321',
                    email: 'anna.nowak@ecsolutions.pl',
                    marketplace: 'Amazon',
                    category: 'integration',
                    priority: 'medium',
                    estimatedValue: 8000,
                    status: 'processing',
                    notes: 'Wysłałem ofertę, czekam na odpowiedź',
                    nextAction: 'Wysłać follow-up email',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 3,
                    name: 'Piotr Wiśniewski',
                    company: 'Online Store',
                    phone: '+48 555 123 456',
                    email: 'piotr.wisniewski@onlinestore.pl',
                    marketplace: 'eBay',
                    category: 'support',
                    priority: 'low',
                    estimatedValue: 2000,
                    status: 'positive',
                    notes: 'Klient bardzo zainteresowany naszymi usługami',
                    nextAction: 'Umówić spotkanie',
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 4,
                    name: 'Maria Zielińska',
                    company: 'Digital Commerce',
                    phone: '+48 777 888 999',
                    email: 'maria.zielinska@digitalcommerce.pl',
                    marketplace: 'eMAG',
                    category: 'consultation',
                    priority: 'high',
                    estimatedValue: 12000,
                    status: 'closed',
                    notes: 'Podpisana umowa, projekt w realizacji',
                    nextAction: 'Monitoring projektu',
                    createdAt: new Date(Date.now() - 259200000).toISOString()
                }
            ];
            
            this.leads = sampleLeads;
            this.saveToStorage();
            this.renderLeads();
            this.updateStats();
        }
    }

    openModal(leadId = null) {
        this.editingLeadId = leadId;
        const modal = document.getElementById('leadModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('leadForm');

        if (leadId) {
            const lead = this.leads.find(l => l.id === leadId);
            if (lead) {
                title.textContent = 'Edytuj Lead';
                this.fillForm(lead);
            }
        } else {
            title.textContent = 'Nowy Lead';
            form.reset();
        }

        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('leadModal');
        modal.classList.remove('show');
        this.editingLeadId = null;
    }

    openStatusModal(leadId) {
        this.currentLeadId = leadId;
        const modal = document.getElementById('statusModal');
        modal.classList.add('show');
    }

    closeStatusModal() {
        const modal = document.getElementById('statusModal');
        modal.classList.remove('show');
        this.currentLeadId = null;
    }

    openTemplates() {
        const modal = document.getElementById('templatesModal');
        modal.classList.add('show');
    }

    closeTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        modal.classList.remove('show');
    }

    openDashboard() {
        const modal = document.getElementById('dashboardModal');
        modal.classList.add('show');
    }

    closeDashboardModal() {
        const modal = document.getElementById('dashboardModal');
        modal.classList.remove('show');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.editingLeadId = null;
        this.currentLeadId = null;
    }

    fillForm(lead) {
        document.getElementById('name').value = lead.name;
        document.getElementById('company').value = lead.company || '';
        document.getElementById('phone').value = lead.phone;
        document.getElementById('email').value = lead.email || '';
        document.getElementById('marketplace').value = lead.marketplace || '';
        document.getElementById('category').value = lead.category || 'sales';
        document.getElementById('priority').value = lead.priority || 'medium';
        document.getElementById('estimatedValue').value = lead.estimatedValue || '';
        document.getElementById('notes').value = lead.notes || '';
        document.getElementById('nextAction').value = lead.nextAction || '';
    }

    saveLead() {
        const formData = new FormData(document.getElementById('leadForm'));
        const leadData = {
            name: formData.get('name'),
            company: formData.get('company'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            marketplace: formData.get('marketplace'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            estimatedValue: parseFloat(formData.get('estimatedValue')) || 0,
            notes: formData.get('notes'),
            nextAction: formData.get('nextAction'),
            status: 'new',
            createdAt: new Date().toISOString()
        };

        if (this.editingLeadId) {
            // Update existing lead
            const index = this.leads.findIndex(l => l.id === this.editingLeadId);
            if (index !== -1) {
                this.leads[index] = { ...this.leads[index], ...leadData };
            }
        } else {
            // Add new lead
            leadData.id = Date.now();
            this.leads.unshift(leadData);
        }

        this.saveToStorage();
        this.renderLeads();
        this.updateStats();
        this.updateLeadsCount();
        this.closeModal();
        this.showNotification('Lead został zapisany!', 'success');
    }

    changeLeadStatus(newStatus) {
        if (this.currentLeadId) {
            const lead = this.leads.find(l => l.id === this.currentLeadId);
            if (lead) {
                lead.status = newStatus;
                this.saveToStorage();
                this.renderLeads();
                this.updateStats();
                this.closeStatusModal();
                this.showNotification('Status został zmieniony!', 'success');
            }
        }
    }

    deleteLead(leadId) {
        if (confirm('Czy na pewno chcesz usunąć tego leada?')) {
            this.leads = this.leads.filter(l => l.id !== leadId);
            this.saveToStorage();
            this.renderLeads();
            this.updateStats();
            this.updateLeadsCount();
            this.showNotification('Lead został usunięty!', 'success');
        }
    }

    setFilter(status) {
        this.currentFilter = status;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');
        
        this.renderLeads();
    }

    setSearch(query) {
        this.currentSearch = query.toLowerCase();
        this.renderLeads();
    }

    toggleFilters() {
        const content = document.getElementById('filtersContent');
        const button = document.querySelector('.filters-header button');
        const icon = button.querySelector('i');
        
        if (content.classList.contains('show')) {
            content.classList.remove('show');
            icon.className = 'fas fa-chevron-down';
            button.innerHTML = '<i class="fas fa-chevron-down"></i> Rozwiń';
        } else {
            content.classList.add('show');
            icon.className = 'fas fa-chevron-up';
            button.innerHTML = '<i class="fas fa-chevron-up"></i> Zwiń';
        }
    }

    applyFilters() {
        this.renderLeads();
    }

    clearFilters() {
        this.filters = {
            status: 'all',
            marketplace: '',
            priority: '',
            category: '',
            minValue: '',
            maxValue: '',
            dateFrom: '',
            dateTo: ''
        };

        // Reset form inputs
        document.getElementById('marketplaceFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('minValue').value = '';
        document.getElementById('maxValue').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';

        this.renderLeads();
        this.showNotification('Filtry zostały wyczyszczone!', 'success');
    }

    getFilteredLeads() {
        let filtered = this.leads;

        // Filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === this.currentFilter);
        }

        // Filter by marketplace
        if (this.filters.marketplace) {
            filtered = filtered.filter(lead => lead.marketplace === this.filters.marketplace);
        }

        // Filter by priority
        if (this.filters.priority) {
            filtered = filtered.filter(lead => lead.priority === this.filters.priority);
        }

        // Filter by category
        if (this.filters.category) {
            filtered = filtered.filter(lead => lead.category === this.filters.category);
        }

        // Filter by value range
        if (this.filters.minValue) {
            filtered = filtered.filter(lead => lead.estimatedValue >= parseFloat(this.filters.minValue));
        }
        if (this.filters.maxValue) {
            filtered = filtered.filter(lead => lead.estimatedValue <= parseFloat(this.filters.maxValue));
        }

        // Filter by date range
        if (this.filters.dateFrom) {
            filtered = filtered.filter(lead => new Date(lead.createdAt) >= new Date(this.filters.dateFrom));
        }
        if (this.filters.dateTo) {
            filtered = filtered.filter(lead => new Date(lead.createdAt) <= new Date(this.filters.dateTo));
        }

        // Filter by search
        if (this.currentSearch) {
            filtered = filtered.filter(lead => 
                lead.name.toLowerCase().includes(this.currentSearch) ||
                lead.company?.toLowerCase().includes(this.currentSearch) ||
                lead.phone.includes(this.currentSearch) ||
                lead.email?.toLowerCase().includes(this.currentSearch) ||
                lead.marketplace.toLowerCase().includes(this.currentSearch) ||
                lead.notes?.toLowerCase().includes(this.currentSearch)
            );
        }

        return filtered;
    }

    renderLeads() {
        const leadsList = document.getElementById('leadsList');
        const filteredLeads = this.getFilteredLeads();

        if (filteredLeads.length === 0) {
            leadsList.innerHTML = `
                <div class="no-leads">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem;"></i>
                    <h3>Brak leadów</h3>
                    <p>Nie znaleziono leadów spełniających kryteria wyszukiwania.</p>
                </div>
            `;
            return;
        }

        leadsList.innerHTML = filteredLeads.map(lead => this.createLeadCard(lead)).join('');
    }

    createLeadCard(lead) {
        const statusLabels = {
            new: 'Nowy Lead',
            processing: 'W Obsłudze',
            negative: 'Negatyw',
            positive: 'Pozytyw',
            closed: 'Zamknięte'
        };

        const statusIcons = {
            new: 'fas fa-user-plus',
            processing: 'fas fa-clock',
            negative: 'fas fa-thumbs-down',
            positive: 'fas fa-thumbs-up',
            closed: 'fas fa-check-circle'
        };

        const priorityLabels = {
            low: 'Niski',
            medium: 'Średni',
            high: 'Wysoki'
        };

        const categoryLabels = {
            sales: 'Sprzedaż',
            support: 'Wsparcie',
            integration: 'Integracja',
            consultation: 'Konsultacja'
        };

        const createdAt = new Date(lead.createdAt).toLocaleDateString('pl-PL');

        return `
            <div class="lead-card ${lead.status}">
                <div class="lead-header">
                    <div>
                        <div class="lead-name">${lead.name}</div>
                        ${lead.company ? `<div class="lead-company">${lead.company}</div>` : ''}
                        <div class="lead-status ${lead.status}">
                            <i class="${statusIcons[lead.status]}"></i>
                            ${statusLabels[lead.status]}
                        </div>
                    </div>
                </div>
                
                <div class="lead-info">
                    <p><i class="fas fa-phone"></i> ${lead.phone}</p>
                    ${lead.email ? `<p><i class="fas fa-envelope"></i> ${lead.email}</p>` : ''}
                    <p><i class="fas fa-store"></i> ${lead.marketplace}</p>
                    <p><i class="fas fa-tag"></i> ${categoryLabels[lead.category]}</p>
                    <div class="lead-priority ${lead.priority}">${priorityLabels[lead.priority]}</div>
                    ${lead.estimatedValue > 0 ? `<p><i class="fas fa-euro-sign"></i> ${lead.estimatedValue.toLocaleString('pl-PL')} zł</p>` : ''}
                    ${lead.notes ? `<p><i class="fas fa-sticky-note"></i> ${lead.notes}</p>` : ''}
                    ${lead.nextAction ? `<p><i class="fas fa-tasks"></i> ${lead.nextAction}</p>` : ''}
                    <p><i class="fas fa-calendar"></i> Utworzono: ${createdAt}</p>
                </div>
                
                <div class="lead-actions">
                    <button class="btn-change-status" onclick="qsellLeadManager.openStatusModal(${lead.id})">
                        <i class="fas fa-exchange-alt"></i> Zmień Status
                    </button>
                    <button class="btn-edit" onclick="qsellLeadManager.openModal(${lead.id})">
                        <i class="fas fa-edit"></i> Edytuj
                    </button>
                    <button class="btn-delete" onclick="qsellLeadManager.deleteLead(${lead.id})">
                        <i class="fas fa-trash"></i> Usuń
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const stats = {
            new: this.leads.filter(l => l.status === 'new').length,
            processing: this.leads.filter(l => l.status === 'processing').length,
            negative: this.leads.filter(l => l.status === 'negative').length,
            positive: this.leads.filter(l => l.status === 'positive').length,
            closed: this.leads.filter(l => l.status === 'closed').length
        };

        const totalValue = this.leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

        document.getElementById('newCount').textContent = stats.new;
        document.getElementById('processingCount').textContent = stats.processing;
        document.getElementById('positiveCount').textContent = stats.positive;
        document.getElementById('closedCount').textContent = stats.closed;
        document.getElementById('totalValue').textContent = totalValue.toLocaleString('pl-PL') + ' zł';
    }

    updateLeadsCount() {
        const filteredLeads = this.getFilteredLeads();
        document.getElementById('leadsCount').textContent = `${filteredLeads.length} leadów`;
    }

    saveToStorage() {
        localStorage.setItem('qsell_leads', JSON.stringify(this.leads));
    }

    exportToExcel() {
        const filteredLeads = this.getFilteredLeads();
        
        if (filteredLeads.length === 0) {
            this.showNotification('Brak leadów do eksportu!', 'error');
            return;
        }

        // Create CSV content
        const headers = ['Imię', 'Firma', 'Telefon', 'Email', 'Marketplace', 'Kategoria', 'Priorytet', 'Wartość', 'Status', 'Notatki', 'Następna Akcja', 'Data Utworzenia'];
        const csvContent = [
            headers.join(','),
            ...filteredLeads.map(lead => [
                lead.name,
                lead.company || '',
                lead.phone,
                lead.email || '',
                lead.marketplace,
                lead.category,
                lead.priority,
                lead.estimatedValue || 0,
                lead.status,
                (lead.notes || '').replace(/,/g, ';'),
                (lead.nextAction || '').replace(/,/g, ';'),
                new Date(lead.createdAt).toLocaleDateString('pl-PL')
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `qsell_leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Eksport zakończony!', 'success');
    }

    openReminders() {
        const reminders = this.leads.filter(lead => lead.nextAction && lead.status !== 'closed');
        
        if (reminders.length === 0) {
            this.showNotification('Brak przypomnień!', 'info');
            return;
        }

        let message = 'Przypomnienia:\n\n';
        reminders.forEach(lead => {
            message += `• ${lead.name} (${lead.company || 'Brak firmy'}): ${lead.nextAction}\n`;
        });

        alert(message);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#fd7e14';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Calculator Methods
    initCalculator() {
        this.updateCalculator();
    }

    updateCalculator() {
        const itemsCount = parseInt(document.getElementById('itemsCount').value) || 0;
        const adsPlatform = document.getElementById('adsPlatform').value;
        const deploymentPlatform = document.getElementById('deploymentPlatform').value;
        const deploymentProducts = parseInt(document.getElementById('deploymentProducts').value) || 0;

        // Calculate items price (base: 1500 items = 5000 zł)
        const itemsPrice = Math.max(0, Math.ceil(itemsCount / 1500) * 5000);
        document.getElementById('itemsPrice').textContent = itemsPrice.toLocaleString('pl-PL') + ' zł';
        document.getElementById('itemsPrice').parentElement.querySelector('.description').textContent = 
            `Cena za ${itemsCount.toLocaleString('pl-PL')} przedmiotów`;

        // Calculate ADS price
        let adsPrice = 0;
        let adsDescription = '';
        if (adsPlatform === 'ebay') {
            adsPrice = 1390;
            adsDescription = 'Miesięczna opłata za eBay ADS';
        } else if (adsPlatform === 'kaufland') {
            adsPrice = 1390;
            adsDescription = 'Miesięczna opłata za Kaufland ADS';
        } else if (adsPlatform === 'both') {
            adsPrice = 2780;
            adsDescription = 'Miesięczna opłata za eBay + Kaufland ADS';
        }
        document.getElementById('adsPrice').textContent = adsPrice.toLocaleString('pl-PL') + ' zł';
        document.getElementById('adsPrice').parentElement.querySelector('.description').textContent = adsDescription;

        // Calculate deployment price
        let deploymentPrice = 0;
        let deploymentDescription = '';
        if (deploymentPlatform === 'amazon') {
            if (deploymentProducts <= 1000) {
                deploymentPrice = 3000;
            } else if (deploymentProducts <= 3000) {
                deploymentPrice = 6000;
            } else if (deploymentProducts <= 5000) {
                deploymentPrice = 10000;
            } else {
                deploymentPrice = 10000 + Math.ceil((deploymentProducts - 5000) / 1000) * 1000;
            }
            deploymentDescription = `Wdrożenie na Amazon (${deploymentProducts.toLocaleString('pl-PL')} produktów)`;
        } else if (deploymentPlatform === 'kaufland') {
            if (deploymentProducts <= 500) {
                deploymentPrice = 2500;
            } else if (deploymentProducts <= 1000) {
                deploymentPrice = 3500;
            } else {
                deploymentPrice = 4500;
            }
            deploymentDescription = `Wdrożenie na Kaufland (${deploymentProducts.toLocaleString('pl-PL')} produktów)`;
        }
        document.getElementById('deploymentPrice').textContent = deploymentPrice.toLocaleString('pl-PL') + ' zł';
        document.getElementById('deploymentPrice').parentElement.querySelector('.description').textContent = deploymentDescription;

        // Calculate total
        let total = itemsPrice + adsPrice + deploymentPrice;
        let discount = 0;
        let discountInfo = document.getElementById('discountInfo');

        // Apply discount for multiple services
        const servicesCount = [itemsPrice, adsPrice, deploymentPrice].filter(price => price > 0).length;
        if (servicesCount >= 2) {
            discount = 500;
            total -= discount;
            discountInfo.style.display = 'block';
        } else {
            discountInfo.style.display = 'none';
        }

        document.getElementById('totalPrice').textContent = total.toLocaleString('pl-PL') + ' zł';
    }

    addToLeads() {
        const itemsCount = parseInt(document.getElementById('itemsCount').value) || 0;
        const adsPlatform = document.getElementById('adsPlatform').value;
        const deploymentPlatform = document.getElementById('deploymentPlatform').value;
        const deploymentProducts = parseInt(document.getElementById('deploymentProducts').value) || 0;
        const totalPrice = parseInt(document.getElementById('totalPrice').textContent.replace(/[^\d]/g, '')) || 0;

        if (totalPrice === 0) {
            this.showNotification('Wybierz przynajmniej jedną usługę!', 'error');
            return;
        }

        // Create lead description
        let description = 'Wycena z kalkulatora:\n';
        if (itemsCount > 0) {
            description += `- Przerzucenie ${itemsCount.toLocaleString('pl-PL')} przedmiotów\n`;
        }
        if (adsPlatform && adsPlatform !== '') {
            description += `- Prowadzenie ADS: ${adsPlatform}\n`;
        }
        if (deploymentProducts > 0) {
            description += `- Wdrożenie na ${deploymentPlatform}: ${deploymentProducts.toLocaleString('pl-PL')} produktów\n`;
        }
        description += `\nCałkowita wartość: ${totalPrice.toLocaleString('pl-PL')} zł`;

        // Create new lead
        const leadData = {
            id: Date.now(),
            name: 'Lead z Kalkulatora',
            company: 'QSell Calculator',
            phone: '+48 000 000 000',
            email: 'calculator@qsell.pl',
            marketplace: deploymentPlatform === 'amazon' ? 'Amazon' : deploymentPlatform === 'kaufland' ? 'Kaufland' : 'Other',
            category: 'sales',
            priority: 'medium',
            estimatedValue: totalPrice,
            notes: description,
            nextAction: 'Skontaktować się z klientem w sprawie wyceny',
            status: 'new',
            createdAt: new Date().toISOString()
        };

        this.leads.unshift(leadData);
        this.saveToStorage();
        this.renderLeads();
        this.updateStats();
        this.updateLeadsCount();
        this.showNotification('Lead został dodany z kalkulatora!', 'success');
    }
}

// Amazon FBA/FBM Calculator Pro
class AmazonCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.updateReferralFee();
    }

    setupEventListeners() {
        // Product category change
        document.getElementById('productCategory').addEventListener('change', () => {
            this.updateReferralFee();
        });

        // Real-time calculations
        const inputs = [
            'sellingPrice', 'productCost', 'productLength', 'productWidth', 'productHeight', 
            'productWeight', 'monthlySales', 'storageMonths', 'inboundShipping', 'prepFees',
            'customShippingCost', 'packagingCost', 'packagingTime', 'hourlyRate', 'overheadCosts',
            'referralFee', 'variableClosingFee', 'acpc', 'conversionRate', 'returnRate', 'returnCost'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateStats());
            }
        });

        // Select elements
        const selects = [
            'fbaSizeTier', 'fbaWeightTier', 'peakSeason', 'shippingMethod', 'seasonality'
        ];

        selects.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateStats());
            }
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remove active class from all tabs
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    updateReferralFee() {
        const category = document.getElementById('productCategory').value;
        const referralFeeInput = document.getElementById('referralFee');
        
        const referralFees = {
            'electronics': 8,
            'books': 15,
            'clothing': 17,
            'beauty': 15,
            'sports': 17,
            'home': 15,
            'toys': 15,
            'automotive': 12,
            'health': 15,
            'other': 15
        };

        if (category && referralFees[category]) {
            referralFeeInput.value = referralFees[category];
        }
    }

    updateStats() {
        const data = this.getFormData();
        const results = this.calculateAll(data);
        this.displayResults(results);
        this.updateQuickStats(results);
    }

    getFormData() {
        return {
            // Basic info
            productName: document.getElementById('productName').value,
            productCategory: document.getElementById('productCategory').value,
            sellingPrice: parseFloat(document.getElementById('sellingPrice').value) || 0,
            productCost: parseFloat(document.getElementById('productCost').value) || 0,
            
            // Dimensions
            productLength: parseFloat(document.getElementById('productLength').value) || 0,
            productWidth: parseFloat(document.getElementById('productWidth').value) || 0,
            productHeight: parseFloat(document.getElementById('productHeight').value) || 0,
            productWeight: parseFloat(document.getElementById('productWeight').value) || 0,
            
            // Sales plan
            monthlySales: parseInt(document.getElementById('monthlySales').value) || 0,
            seasonality: parseFloat(document.getElementById('seasonality').value) || 1,
            
            // FBA costs
            fbaSizeTier: document.getElementById('fbaSizeTier').value,
            fbaWeightTier: document.getElementById('fbaWeightTier').value,
            storageMonths: parseInt(document.getElementById('storageMonths').value) || 0,
            peakSeason: document.getElementById('peakSeason').value === 'true',
            inboundShipping: parseFloat(document.getElementById('inboundShipping').value) || 0,
            prepFees: parseFloat(document.getElementById('prepFees').value) || 0,
            
            // FBM costs
            shippingMethod: document.getElementById('shippingMethod').value,
            customShippingCost: parseFloat(document.getElementById('customShippingCost').value) || 0,
            packagingCost: parseFloat(document.getElementById('packagingCost').value) || 0,
            packagingTime: parseFloat(document.getElementById('packagingTime').value) || 0,
            hourlyRate: parseFloat(document.getElementById('hourlyRate').value) || 0,
            overheadCosts: parseFloat(document.getElementById('overheadCosts').value) || 0,
            
            // Advanced
            referralFee: parseFloat(document.getElementById('referralFee').value) || 0,
            variableClosingFee: parseFloat(document.getElementById('variableClosingFee').value) || 0,
            acpc: parseFloat(document.getElementById('acpc').value) || 0,
            conversionRate: parseFloat(document.getElementById('conversionRate').value) || 0,
            returnRate: parseFloat(document.getElementById('returnRate').value) || 0,
            returnCost: parseFloat(document.getElementById('returnCost').value) || 0
        };
    }

    calculateAll(data) {
        const monthlyRevenue = data.sellingPrice * data.monthlySales * data.seasonality;
        const totalProductCost = data.productCost * data.monthlySales * data.seasonality;
        const referralFeeTotal = (monthlyRevenue * data.referralFee / 100) + (data.variableClosingFee * data.monthlySales * data.seasonality);
        
        // FBA Calculations
        const fbaFees = this.calculateFBAFees(data);
        const fbaProfit = monthlyRevenue - totalProductCost - referralFeeTotal - fbaFees.total;
        
        // FBM Calculations
        const fbmFees = this.calculateFBMFees(data);
        const fbmProfit = monthlyRevenue - totalProductCost - referralFeeTotal - fbmFees.total;
        
        // ROI and Margins
        const fbaROI = totalProductCost > 0 ? (fbaProfit / totalProductCost) * 100 : 0;
        const fbmROI = totalProductCost > 0 ? (fbmProfit / totalProductCost) * 100 : 0;
        const fbaMargin = monthlyRevenue > 0 ? (fbaProfit / monthlyRevenue) * 100 : 0;
        const fbmMargin = monthlyRevenue > 0 ? (fbmProfit / monthlyRevenue) * 100 : 0;
        
        // Recommendation
        const recommendation = fbaProfit > fbmProfit ? 'FBA' : 'FBM';
        const profitDifference = Math.abs(fbaProfit - fbmProfit);
        
        return {
            fba: {
                revenue: monthlyRevenue,
                productCost: totalProductCost,
                referralFee: referralFeeTotal,
                fulfillmentFee: fbaFees.fulfillment,
                storageFee: fbaFees.storage,
                inboundShipping: fbaFees.inboundShipping,
                prepFees: fbaFees.prepFees,
                total: fbaFees.total,
                profit: fbaProfit,
                roi: fbaROI,
                margin: fbaMargin
            },
            fbm: {
                revenue: monthlyRevenue,
                productCost: totalProductCost,
                referralFee: referralFeeTotal,
                shippingCost: fbmFees.shipping,
                packagingCost: fbmFees.packaging,
                laborCost: fbmFees.labor,
                overheadCost: fbmFees.overhead,
                total: fbmFees.total,
                profit: fbmProfit,
                roi: fbmROI,
                margin: fbmMargin
            },
            comparison: {
                profitDifference,
                recommendation,
                betterProfit: Math.max(fbaProfit, fbmProfit),
                betterROI: Math.max(fbaROI, fbmROI),
                betterMargin: Math.max(fbaMargin, fbmMargin)
            }
        };
    }

    calculateFBAFees(data) {
        // Fulfillment fees based on size and weight
        let fulfillmentFee = 0;
        const volume = data.productLength * data.productWidth * data.productHeight;
        
        if (data.fbaSizeTier === 'small') {
            fulfillmentFee = data.productWeight <= 0.5 ? 2.50 : 3.50;
        } else if (data.fbaSizeTier === 'medium') {
            fulfillmentFee = data.productWeight <= 1 ? 4.50 : 6.50;
        } else if (data.fbaSizeTier === 'large') {
            fulfillmentFee = data.productWeight <= 2 ? 6.50 : 8.50;
        } else if (data.fbaSizeTier === 'oversize') {
            fulfillmentFee = data.productWeight <= 5 ? 8.50 : 12.50;
        }
        
        // Storage fees
        let storageRate = data.peakSeason ? 2.40 : 0.75; // zł/m³/mies.
        const volumeCubicMeters = volume / 1000000; // Convert cm³ to m³
        const storageFee = volumeCubicMeters * storageRate * data.storageMonths;
        
        // Total FBA fees
        const fulfillmentTotal = fulfillmentFee * data.monthlySales * data.seasonality;
        const inboundShippingTotal = data.inboundShipping * data.monthlySales * data.seasonality;
        const prepFeesTotal = data.prepFees * data.monthlySales * data.seasonality;
        
        return {
            fulfillment: fulfillmentTotal,
            storage: storageFee,
            inboundShipping: inboundShippingTotal,
            prepFees: prepFeesTotal,
            total: fulfillmentTotal + storageFee + inboundShippingTotal + prepFeesTotal
        };
    }

    calculateFBMFees(data) {
        // Shipping costs
        let shippingCost = 0;
        if (data.shippingMethod === 'inpost') {
            shippingCost = data.productWeight <= 1 ? 8 : 12;
        } else if (data.shippingMethod === 'poczta') {
            shippingCost = data.productWeight <= 1 ? 10 : 15;
        } else if (data.shippingMethod === 'dpd') {
            shippingCost = data.productWeight <= 1 ? 12 : 18;
        } else if (data.shippingMethod === 'ups') {
            shippingCost = data.productWeight <= 1 ? 15 : 25;
        } else if (data.shippingMethod === 'custom') {
            shippingCost = data.customShippingCost;
        }
        
        // Labor costs
        const packagingTimeHours = data.packagingTime / 60;
        const laborCostPerUnit = packagingTimeHours * data.hourlyRate;
        
        // Total FBM fees
        const shippingTotal = shippingCost * data.monthlySales * data.seasonality;
        const packagingTotal = data.packagingCost * data.monthlySales * data.seasonality;
        const laborTotal = laborCostPerUnit * data.monthlySales * data.seasonality;
        const overheadPerUnit = data.overheadCosts / (data.monthlySales * data.seasonality);
        const overheadTotal = overheadPerUnit * data.monthlySales * data.seasonality;
        
        return {
            shipping: shippingTotal,
            packaging: packagingTotal,
            labor: laborTotal,
            overhead: overheadTotal,
            total: shippingTotal + packagingTotal + laborTotal + overheadTotal
        };
    }

    displayResults(results) {
        // FBA Results
        document.getElementById('fbaRevenue').textContent = results.fba.revenue.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaProductCost').textContent = results.fba.productCost.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaReferralFee').textContent = results.fba.referralFee.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaFulfillmentFee').textContent = results.fba.fulfillmentFee.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaStorageFee').textContent = results.fba.storageFee.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaInboundShipping').textContent = results.fba.inboundShipping.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaPrepFees').textContent = results.fba.prepFees.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaTotalProfit').textContent = results.fba.profit.toLocaleString('pl-PL') + ' zł';
        
        // FBM Results
        document.getElementById('fbmRevenue').textContent = results.fbm.revenue.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmProductCost').textContent = results.fbm.productCost.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmReferralFee').textContent = results.fbm.referralFee.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmShippingCost').textContent = results.fbm.shippingCost.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmPackagingCost').textContent = results.fbm.packagingCost.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmLaborCost').textContent = results.fbm.laborCost.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmOverheadCost').textContent = results.fbm.overheadCost.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmTotalProfit').textContent = results.fbm.profit.toLocaleString('pl-PL') + ' zł';
        
        // Comparison
        document.getElementById('profitDifference').textContent = results.comparison.profitDifference.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbaROI').textContent = results.fba.roi.toFixed(1) + '%';
        document.getElementById('fbmROI').textContent = results.fbm.roi.toFixed(1) + '%';
        document.getElementById('fbaMargin').textContent = results.fba.margin.toFixed(1) + '%';
        document.getElementById('fbmMargin').textContent = results.fbm.margin.toFixed(1) + '%';
        document.getElementById('finalRecommendation').textContent = results.comparison.recommendation;
        
        // Generate insights
        this.generateInsights(results);
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
    }

    updateQuickStats(results) {
        document.getElementById('fbaProfit').textContent = results.fba.profit.toLocaleString('pl-PL') + ' zł';
        document.getElementById('fbmProfit').textContent = results.fbm.profit.toLocaleString('pl-PL') + ' zł';
        document.getElementById('roiPercentage').textContent = results.comparison.betterROI.toFixed(1) + '%';
        document.getElementById('profitMargin').textContent = results.comparison.betterMargin.toFixed(1) + '%';
        document.getElementById('recommendation').textContent = results.comparison.recommendation;
    }

    generateInsights(results) {
        // Price optimization insights
        const priceOptimization = this.getPriceOptimizationInsights(results);
        document.getElementById('priceOptimization').textContent = priceOptimization;
        
        // FBA strategy insights
        const fbaStrategy = this.getFBAStrategyInsights(results);
        document.getElementById('fbaStrategy').textContent = fbaStrategy;
        
        // FBM strategy insights
        const fbmStrategy = this.getFBMStrategyInsights(results);
        document.getElementById('fbmStrategy').textContent = fbmStrategy;
    }

    getPriceOptimizationInsights(results) {
        const betterProfit = results.comparison.betterProfit;
        const betterMargin = results.comparison.betterMargin;
        
        if (betterProfit < 0) {
            return 'Produkt nie jest opłacalny. Rozważ podniesienie ceny lub obniżenie kosztów.';
        } else if (betterMargin < 10) {
            return 'Niska marża. Rozważ optymalizację kosztów lub podniesienie ceny.';
        } else if (betterMargin < 25) {
            return 'Średnia marża. Można rozważyć optymalizację dla lepszych wyników.';
        } else {
            return 'Wysoka marża! Produkt jest bardzo opłacalny.';
        }
    }

    getFBAStrategyInsights(results) {
        const fbaProfit = results.fba.profit;
        const fbaROI = results.fba.roi;
        
        if (fbaProfit > results.fbm.profit) {
            return 'FBA jest bardziej opłacalne. Skup się na optymalizacji fulfillment fees i storage.';
        } else {
            return 'FBA mniej opłacalne niż FBM. Rozważ FBM lub optymalizację kosztów FBA.';
        }
    }

    getFBMStrategyInsights(results) {
        const fbmProfit = results.fbm.profit;
        const fbmROI = results.fbm.roi;
        
        if (fbmProfit > results.fba.profit) {
            return 'FBM jest bardziej opłacalne. Skup się na automatyzacji i optymalizacji procesów.';
        } else {
            return 'FBM mniej opłacalne niż FBA. Rozważ przejście na FBA lub optymalizację kosztów.';
        }
    }
}

// Global functions for HTML onclick handlers
function openModal() {
    qsellLeadManager.openModal();
}

function closeModal() {
    qsellLeadManager.closeModal();
}

function closeStatusModal() {
    qsellLeadManager.closeStatusModal();
}

function closeTemplatesModal() {
    qsellLeadManager.closeTemplatesModal();
}

function closeDashboardModal() {
    qsellLeadManager.closeDashboardModal();
}

function toggleFilters() {
    qsellLeadManager.toggleFilters();
}

function clearFilters() {
    qsellLeadManager.clearFilters();
}

function applyFilters() {
    qsellLeadManager.applyFilters();
}

function exportToExcel() {
    qsellLeadManager.exportToExcel();
}

function openTemplates() {
    qsellLeadManager.openTemplates();
}

function openReminders() {
    qsellLeadManager.openReminders();
}

function openDashboard() {
    qsellLeadManager.openDashboard();
}

function copyTemplate(button) {
    const templateText = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(templateText).then(() => {
        qsellLeadManager.showNotification('Szablon skopiowany!', 'success');
    });
}

// Calculator functions
function addToLeads() {
    qsellLeadManager.addToLeads();
}

function createQuickLead(title, value) {
    const leadData = {
        id: Date.now(),
        name: `Lead - ${title}`,
        company: 'QSell Quick Lead',
        phone: '+48 000 000 000',
        email: 'quicklead@qsell.pl',
        marketplace: title.includes('Amazon') ? 'Amazon' : 'Other',
        category: 'sales',
        priority: 'medium',
        estimatedValue: value,
        notes: `Szybki lead utworzony dla: ${title}\nWartość: ${value.toLocaleString('pl-PL')} zł`,
        nextAction: 'Skontaktować się z klientem',
        status: 'new',
        createdAt: new Date().toISOString()
    };

    qsellLeadManager.leads.unshift(leadData);
    qsellLeadManager.saveToStorage();
    qsellLeadManager.renderLeads();
    qsellLeadManager.updateStats();
    qsellLeadManager.updateLeadsCount();
    qsellLeadManager.showNotification(`Lead "${title}" został dodany!`, 'success');
}

function calculateAmazonPrice() {
    // Set calculator to Amazon deployment
    document.getElementById('deploymentPlatform').value = 'amazon';
    document.getElementById('deploymentProducts').value = '5000';
    qsellLeadManager.updateCalculator();
    
    // Scroll to calculator
    document.querySelector('.price-calculator').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function calculateAdsPrice() {
    // Set calculator to ADS
    document.getElementById('adsPlatform').value = 'both';
    qsellLeadManager.updateCalculator();
    
    // Scroll to calculator
    document.querySelector('.price-calculator').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Initialize the application
let qsellLeadManager;
document.addEventListener('DOMContentLoaded', () => {
    qsellLeadManager = new QSellLeadManager();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-leads {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .no-leads h3 {
        color: white;
        margin-bottom: 0.5rem;
    }
    
    .no-leads p {
        color: rgba(255, 255, 255, 0.7);
    }
`;
document.head.appendChild(style); 
