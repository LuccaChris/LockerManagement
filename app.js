  // Dados dos armários
        let lockers = {};
        let currentLocker = null;

        // Inicializar armários
        function initializeLockers() {
            const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            let lockerNumber = 1;
            
            sections.forEach(section => {
                for (let i = 1; i <= 50; i++) {
                    const lockerId = `${section}${String(i).padStart(3, '0')}`;
                    lockers[lockerId] = {
                        id: lockerId,
                        status: 'available',
                        employee: null,
                        assignedDate: null
                    };
                    lockerNumber++;
                }
            });

        }

        // Renderizar grade de armários
        function renderLockers() {
            const grid = document.getElementById('lockersGrid');
            grid.innerHTML = '';

            Object.values(lockers).forEach(locker => {
                if (shouldShowLocker(locker)) {
                    const lockerElement = document.createElement('div');
                    lockerElement.className = `locker w-8 h-8 rounded cursor-pointer flex items-center justify-center text-xs font-bold text-white shadow-md ${locker.status}`;
                    lockerElement.textContent = locker.id.slice(-2);
                    lockerElement.title = `${locker.id} - ${getStatusText(locker.status)}`;
                    lockerElement.onclick = () => openLockerModal(locker.id);
                    grid.appendChild(lockerElement);
                }
            });

            updateCounts();
        }

        // Verificar se o armário deve ser mostrado baseado nos filtros
        function shouldShowLocker(locker) {
            const searchLocker = document.getElementById('searchLocker').value.toLowerCase();
            const searchEmployee = document.getElementById('searchEmployee').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value;

            if (searchLocker && !locker.id.toLowerCase().includes(searchLocker)) {
                return false;
            }

            if (searchEmployee && locker.employee && !locker.employee.name.toLowerCase().includes(searchEmployee)) {
                return false;
            }

            if (statusFilter && locker.status !== statusFilter) {
                return false;
            }

            return true;
        }

        // Obter texto do status
        function getStatusText(status) {
            const statusMap = {
                'available': 'Livre',
                'occupied': 'Ocupado',
                'maintenance': 'Manutenção'
            };
            return statusMap[status] || status;
        }

        // Atualizar contadores
        function updateCounts() {
            const counts = {
                available: 0,
                occupied: 0,
                maintenance: 0
            };

            Object.values(lockers).forEach(locker => {
                counts[locker.status]++;
            });

            document.getElementById('availableCount').textContent = counts.available;
            document.getElementById('occupiedCount').textContent = counts.occupied;
            document.getElementById('maintenanceCount').textContent = counts.maintenance;
        }

        // Abrir modal do armário
        function openLockerModal(lockerId) {
            currentLocker = lockerId;
            const locker = lockers[lockerId];
            
            let detailsHTML = `
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded ${locker.status}"></div>
                        <div>
                            <h3 class="text-lg font-bold">${locker.id}</h3>
                            <p class="text-gray-600">${getStatusText(locker.status)}</p>
                        </div>
                    </div>
            `;

            if (locker.employee) {
                detailsHTML += `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Colaborador:</h4>
                        <p><strong>Nome:</strong> ${locker.employee.name}</p>
                        <p><strong>Matrícula:</strong> ${locker.employee.id}</p>
                        <p><strong>Setor:</strong> ${locker.employee.department}</p>
                        <p><strong>Data de atribuição:</strong> ${new Date(locker.assignedDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                `;
            }

            detailsHTML += '</div>';
            document.getElementById('lockerDetails').innerHTML = detailsHTML;

            // Mostrar/ocultar botões baseado no status
            document.getElementById('assignBtn').style.display = locker.status === 'available' ? 'inline-block' : 'none';
            document.getElementById('releaseBtn').style.display = locker.status === 'occupied' ? 'inline-block' : 'none';
            document.getElementById('maintenanceBtn').textContent = locker.status === 'maintenance' ? 'Finalizar Manutenção' : 'Manutenção';

            document.getElementById('lockerModal').classList.remove('hidden');
        }

        // Fechar modal do armário
        function closeLockerModal() {
            document.getElementById('lockerModal').classList.add('hidden');
            hideAssignForm();
            currentLocker = null;
        }

        // Mostrar formulário de atribuição
        function showAssignForm() {
            document.getElementById('assignForm').classList.remove('hidden');
        }

        // Ocultar formulário de atribuição
        function hideAssignForm() {
            document.getElementById('assignForm').classList.add('hidden');
            document.getElementById('employeeName').value = '';
            document.getElementById('employeeId').value = '';
            document.getElementById('employeeDept').value = '';
        }

        // Atribuir armário
        function assignLocker() {
            const name = document.getElementById('employeeName').value.trim();
            const id = document.getElementById('employeeId').value.trim();
            const dept = document.getElementById('employeeDept').value.trim();

            if (!name || !id || !dept) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            lockers[currentLocker] = {
                ...lockers[currentLocker],
                status: 'occupied',
                employee: {
                    name: name,
                    id: id,
                    department: dept
                },
                assignedDate: new Date().toISOString().split('T')[0]
            };

            renderLockers();
            closeLockerModal();
            alert(`Armário ${currentLocker} atribuído com sucesso!`);
        }

        // Liberar armário
        function releaseLocker() {
            if (confirm(`Tem certeza que deseja liberar o armário ${currentLocker}?`)) {
                lockers[currentLocker] = {
                    ...lockers[currentLocker],
                    status: 'available',
                    employee: null,
                    assignedDate: null
                };

                renderLockers();
                closeLockerModal();
                alert(`Armário ${currentLocker} liberado com sucesso!`);
            }
        }

        // Alternar manutenção
        function toggleMaintenance() {
            const locker = lockers[currentLocker];
            const newStatus = locker.status === 'maintenance' ? 'available' : 'maintenance';
            
            if (newStatus === 'maintenance' && locker.employee) {
                if (!confirm('Este armário está ocupado. Deseja colocá-lo em manutenção mesmo assim? O colaborador será desvinculado.')) {
                    return;
                }
                locker.employee = null;
                locker.assignedDate = null;
            }

            locker.status = newStatus;
            renderLockers();
            closeLockerModal();
            
            const action = newStatus === 'maintenance' ? 'colocado em manutenção' : 'liberado da manutenção';
            alert(`Armário ${currentLocker} ${action} com sucesso!`);
        }

        // Mostrar lista de colaboradores
        function showEmployeeList() {
            const tbody = document.getElementById('employeeTableBody');
            tbody.innerHTML = '';

            Object.values(lockers)
                .filter(locker => locker.employee)
                .forEach(locker => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="border border-gray-300 px-4 py-2 font-mono">${locker.id}</td>
                        <td class="border border-gray-300 px-4 py-2">${locker.employee.name}</td>
                        <td class="border border-gray-300 px-4 py-2">${locker.employee.id}</td>
                        <td class="border border-gray-300 px-4 py-2">${locker.employee.department}</td>
                        <td class="border border-gray-300 px-4 py-2">${new Date(locker.assignedDate).toLocaleDateString('pt-BR')}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Ocupado</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <button onclick="openLockerModal('${locker.id}'); closeEmployeeList();" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                Ver Detalhes
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

            document.getElementById('employeeModal').classList.remove('hidden');
        }

        // Fechar lista de colaboradores
        function closeEmployeeList() {
            document.getElementById('employeeModal').classList.add('hidden');
        }

        // Event listeners para filtros
        document.getElementById('searchLocker').addEventListener('input', renderLockers);
        document.getElementById('searchEmployee').addEventListener('input', renderLockers);
        document.getElementById('statusFilter').addEventListener('change', renderLockers);

        // Inicializar sistema
        initializeLockers();
        renderLockers();