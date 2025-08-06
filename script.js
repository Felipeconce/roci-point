// Datos del equipo
let teamMembers = [
    { id: 'rocio', name: 'Rocío', score: 0 },
    { id: 'javiera', name: 'Javiera', score: 0 },
    { id: 'juan-felipe', name: 'Juan Felipe', score: 0 },
    { id: 'daniel', name: 'Daniel', score: 0 },
    { id: 'alvaro', name: 'Alvaro', score: 0 }
];

// Historial de cambios
let history = [];

// Configuración
let settings = {
    defaultAddPoints: 1,
    defaultSubtractPoints: 1,
    autoSave: true,
    showNotifications: true
};

// Variables para el sistema de comentarios
let currentCommentMember = null;
let currentCommentPoints = 0;

// Variables para el sistema de autenticación
let currentUser = null;
let userCredentials = {
    rocio: { name: 'Rocío', password: 'nueva_clave_rocio', color: '#e74c3c' },
    javiera: { name: 'Javiera', password: 'nueva_clave_javiera', color: '#9b59b6' },
    'juan-felipe': { name: 'Juan Felipe', password: 'nueva_clave_juan', color: '#3498db' },
    daniel: { name: 'Daniel', password: 'nueva_clave_daniel', color: '#f39c12' },
    alvaro: { name: 'Alvaro', password: 'nueva_clave_alvaro', color: '#27ae60' }
};

// Wow effects variables
let confettiParticles = [];
let flameParticles = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar canvas para efectos wow
    const confettiCanvas = document.getElementById('confetti-canvas');
    const flameCanvas = document.getElementById('flame-canvas');
    
    function resizeCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        flameCanvas.width = window.innerWidth;
        flameCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Cargar datos desde la API
    loadDataFromAPI();
    
    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // ESC para cerrar modales
        if (e.key === 'Escape') {
            closeCommentModal();
            closeMemberHistoryModal();
            closeAuthModal();
        }
    });
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('comment-modal')) {
            closeCommentModal();
        }
        if (e.target.classList.contains('member-history-modal')) {
            closeMemberHistoryModal();
        }
        if (e.target.classList.contains('auth-modal')) {
            closeAuthModal();
        }
    });
    
    // Enter para autenticar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.getElementById('auth-modal').style.display === 'block') {
            authenticateUser();
        }
    });
    
    console.log('🎮 Score Online Latam - RociPoints iniciado');
    console.log('📊 Atajo de teclado: ESC (Cerrar modales)');
    console.log('🗄️ Conectado a MongoDB via API');
});

// Función para mostrar modal de autenticación
function showAuthModal(memberId, points) {
    console.log('showAuthModal llamado con:', memberId, points);
    currentCommentMember = memberId;
    currentCommentPoints = points;
    
    const modal = document.getElementById('auth-modal');
    const memberNameSpan = document.getElementById('auth-member-name');
    const pointsChangeSpan = document.getElementById('auth-points-change');
    
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) {
        console.error('Miembro no encontrado en showAuthModal:', memberId);
        showNotification('Error: Miembro no encontrado', 'error');
        return;
    }
    
    memberNameSpan.textContent = member.name;
    pointsChangeSpan.textContent = points > 0 ? `+${points} puntos` : `${points} puntos`;
    pointsChangeSpan.style.color = points > 0 ? '#4ecdc4' : '#ff6b6b';
    
    // Limpiar campos
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    
    modal.style.display = 'block';
    document.getElementById('auth-username').focus();
}

// Función para cerrar modal de autenticación
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'none';
    currentCommentMember = null;
    currentCommentPoints = 0;
    currentUser = null;
}

// Función para autenticar usuario
function authenticateUser() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    
    console.log('authenticateUser llamado con:', username, password);
    console.log('currentCommentMember:', currentCommentMember);
    console.log('currentCommentPoints:', currentCommentPoints);
    
    if (!username || !password) {
        showNotification('Debes ingresar usuario y contraseña', 'error');
        return;
    }
    
    const user = userCredentials[username];
    if (user && user.password === password) {
        currentUser = user;
        
        // Guardar los valores antes de cerrar el modal
        const memberId = currentCommentMember;
        const points = currentCommentPoints;
        
        closeAuthModal();
        
        console.log('Llamando a showCommentModal con:', memberId, points);
        showCommentModal(memberId, points);
    } else {
        showNotification('Usuario o contraseña incorrectos', 'error');
        document.getElementById('auth-password').value = '';
        document.getElementById('auth-password').focus();
    }
}

// Función para mostrar modal de comentario
function showCommentModal(memberId, points) {
    console.log('showCommentModal llamado con:', memberId, points);
    
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) {
        console.error('Miembro no encontrado:', memberId);
        showNotification('Error: Miembro no encontrado', 'error');
        return;
    }
    
    // Establecer las variables globales
    currentCommentMember = memberId;
    currentCommentPoints = points;
    
    console.log('Variables establecidas - currentCommentMember:', currentCommentMember);
    console.log('Variables establecidas - currentCommentPoints:', currentCommentPoints);
    
    const modal = document.getElementById('comment-modal');
    const memberNameSpan = document.getElementById('comment-member-name');
    const pointsChangeSpan = document.getElementById('comment-points-change');
    const commentText = document.getElementById('comment-text');
    const userInfoSpan = document.getElementById('comment-user-info');
    
    memberNameSpan.textContent = member.name;
    pointsChangeSpan.textContent = points > 0 ? `+${points} puntos` : `${points} puntos`;
    pointsChangeSpan.style.color = points > 0 ? '#4ecdc4' : '#ff6b6b';
    
    // Mostrar información del usuario autenticado
    if (currentUser) {
        userInfoSpan.textContent = `Asignado por: ${currentUser.name}`;
        userInfoSpan.style.color = currentUser.color;
        userInfoSpan.style.display = 'block';
    } else {
        userInfoSpan.style.display = 'none';
    }
    
    commentText.value = '';
    modal.style.display = 'block';
    commentText.focus();
}

// Función para cerrar modal de comentario
function closeCommentModal() {
    const modal = document.getElementById('comment-modal');
    modal.style.display = 'none';
    currentCommentMember = null;
    currentCommentPoints = 0;
}

// Función para confirmar cambio de puntos
function confirmPointsChange() {
    const commentText = document.getElementById('comment-text').value.trim();
    
    console.log('confirmPointsChange llamado');
    console.log('commentText:', commentText);
    console.log('currentCommentMember:', currentCommentMember);
    console.log('currentCommentPoints:', currentCommentPoints);
    
    if (!commentText) {
        showNotification('Debes escribir un comentario para justificar los puntos', 'error');
        return;
    }
    
    // Guardar los valores antes de cerrar el modal
    const memberId = currentCommentMember;
    const points = currentCommentPoints;
    
    console.log('Valores guardados - memberId:', memberId, 'points:', points);
    
    // Cerrar el modal después de guardar los valores
    closeCommentModal();
    
    console.log('Llamando a addPoints/subtractPoints con:', memberId, points, commentText);
    
    if (points > 0) {
        addPoints(memberId, points, commentText);
    } else {
        subtractPoints(memberId, Math.abs(points), commentText);
    }
}

// Función para sumar puntos
async function addPoints(memberId, points = 1, comment = '') {
    console.log('addPoints llamado con:', memberId, points, comment);
    
    const member = teamMembers.find(m => m.id === memberId);
    console.log('member encontrado:', member);
    
    if (member) {
        try {
            const response = await fetch(`/api/members/${memberId}/points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    points: points,
                    type: 'add',
                    comment: comment,
                    assignedBy: currentUser ? currentUser.name : 'Anónimo',
                    assignedByColor: currentUser ? currentUser.color : '#95a5a6'
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Actualizar datos locales
                member.score = data.member.score;
                history.unshift(data.historyEntry);
                
                // Mostrar indicador de cambio
                showChangeIndicator(memberId, 'up');
                
                // Actualizar display
                updateDisplay();
                updateRankings();
                updateLeaders();
                
                // Mostrar notificación si está habilitado
                if (settings.showNotifications) {
                    showNotification(`+${points} puntos para ${member.name}`, 'success');
                }
                
                console.log('Llamando a triggerWowEffect...');
                triggerWowEffect('add');
            } else {
                throw new Error('Error al actualizar puntos');
            }
        } catch (error) {
            console.error('Error al actualizar puntos:', error);
            showNotification('Error al actualizar puntos', 'error');
        }
    } else {
        console.error('Miembro no encontrado en addPoints:', memberId);
    }
}

// Función para restar puntos
async function subtractPoints(memberId, points = 1, comment = '') {
    console.log('subtractPoints llamado con:', memberId, points, comment);
    
    const member = teamMembers.find(m => m.id === memberId);
    console.log('member encontrado:', member);
    
    if (member) {
        try {
            const response = await fetch(`/api/members/${memberId}/points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    points: points,
                    type: 'subtract',
                    comment: comment,
                    assignedBy: currentUser ? currentUser.name : 'Anónimo',
                    assignedByColor: currentUser ? currentUser.color : '#95a5a6'
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Actualizar datos locales
                member.score = data.member.score;
                history.unshift(data.historyEntry);
                
                // Mostrar indicador de cambio
                showChangeIndicator(memberId, 'down');
                
                // Actualizar display
                updateDisplay();
                updateRankings();
                updateLeaders();
                
                // Mostrar notificación si está habilitado
                if (settings.showNotifications) {
                    showNotification(`-${points} puntos para ${member.name}`, 'error');
                }
                
                console.log('Llamando a triggerWowEffect...');
                triggerWowEffect('subtract');
            } else {
                throw new Error('Error al actualizar puntos');
            }
        } catch (error) {
            console.error('Error al actualizar puntos:', error);
            showNotification('Error al actualizar puntos', 'error');
        }
    } else {
        console.error('Miembro no encontrado en subtractPoints:', memberId);
    }
}

// Función para mostrar indicador de cambio
function showChangeIndicator(memberId, direction) {
    const memberCard = document.querySelector(`[data-member="${memberId}"]`);
    if (memberCard) {
        const indicator = memberCard.querySelector('.change-indicator');
        if (indicator) {
            indicator.className = `change-indicator ${direction}`;
            setTimeout(() => {
                indicator.className = 'change-indicator';
            }, 600);
        }
    }
}

// Función para agregar al historial
function addToHistory(memberId, points, type, comment = '') {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    const timestamp = new Date();
    const entry = {
        memberId: memberId,
        memberName: member.name,
        points: points,
        type: type,
        comment: comment,
        assignedBy: currentUser ? currentUser.name : 'Anónimo',
        assignedByColor: currentUser ? currentUser.color : '#95a5a6',
        timestamp: timestamp,
        timeString: timestamp.toLocaleTimeString()
    };
    
    history.unshift(entry);
    
    // Mantener solo los últimos 100 elementos
    if (history.length > 100) {
        history = history.slice(0, 100);
    }
    
    updateHistoryDisplay();
}

// Función para actualizar el display
function updateDisplay() {
    console.log('updateDisplay llamado');
    teamMembers.forEach(member => {
        const memberCard = document.querySelector(`[data-member="${member.id}"]`);
        if (memberCard) {
            const scoreElement = memberCard.querySelector('.score');
            if (scoreElement) {
                console.log(`Actualizando ${member.name}: ${scoreElement.textContent} -> ${member.score}`);
                scoreElement.textContent = member.score;
            }
        }
    });
}

// Función para actualizar estadísticas principales
// Función comentada - Panel de estadísticas removido
/*
function updateStats() {
    const totalPoints = teamMembers.reduce((sum, member) => sum + member.score, 0);
    const averagePoints = teamMembers.length > 0 ? Math.round(totalPoints / teamMembers.length) : 0;
    
    // Encontrar el líder
    const leader = teamMembers.reduce((max, member) => 
        member.score > max.score ? member : max, teamMembers[0]);
    
    document.getElementById('total-members').textContent = teamMembers.length;
    document.getElementById('total-points').textContent = totalPoints;
    document.getElementById('average-points').textContent = averagePoints;
    document.getElementById('current-leader').textContent = leader ? leader.name : '-';
}
*/

// Función comentada - Panel de estadísticas detalladas removido
/*
// Función para actualizar estadísticas detalladas
function updateDetailedStats() {
    const today = new Date().toDateString();
    const todayEntries = history.filter(entry => 
        new Date(entry.timestamp).toDateString() === today
    );
    
    const totalChanges = history.length;
    const avgPerChange = totalChanges > 0 ? 
        Math.round(history.reduce((sum, entry) => sum + Math.abs(entry.points), 0) / totalChanges) : 0;
    
    // Calcular mejor racha (puntos positivos consecutivos)
    let bestStreak = 0;
    let currentStreak = 0;
    
    history.forEach(entry => {
        if (entry.points > 0) {
            currentStreak += entry.points;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    });
    
    document.getElementById('today-activity').textContent = `${todayEntries.length} cambios`;
    document.getElementById('best-streak').textContent = `${bestStreak} puntos`;
    document.getElementById('total-changes').textContent = totalChanges;
    document.getElementById('avg-per-change').textContent = avgPerChange;
}
*/

// Función para actualizar rankings
function updateRankings() {
    const sortedMembers = [...teamMembers].sort((a, b) => b.score - a.score);
    
    // Limpiar avatares de líder en todas las tarjetas
    teamMembers.forEach(member => {
        const memberCard = document.querySelector(`[data-member="${member.id}"]`);
        if (memberCard) {
            const avatar = memberCard.querySelector('.avatar img');
            if (avatar) {
                avatar.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                avatar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }
        }
    });
    
    sortedMembers.forEach((member, index) => {
        const memberCard = document.querySelector(`[data-member="${member.id}"]`);
        if (memberCard) {
            const rankBadge = memberCard.querySelector('.rank-badge');
            if (rankBadge) {
                rankBadge.textContent = `#${index + 1}`;
            }
            
            // Si es el líder (índice 0), destacar su avatar
            if (index === 0) {
                const avatar = memberCard.querySelector('.avatar img');
                if (avatar) {
                    avatar.style.border = '3px solid #ffd700';
                    avatar.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                }
            }
        }
    });
}

// Función para reiniciar puntajes
async function resetScores() {
    if (confirm('¿Estás seguro de que quieres reiniciar todos los puntajes?')) {
        try {
            const response = await fetch('/api/members/reset', {
                method: 'PUT'
            });

            if (response.ok) {
                // Actualizar datos locales
                teamMembers.forEach(member => {
                    member.score = 0;
                });
                
                updateDisplay();
                updateRankings();
                
                if (settings.showNotifications) {
                    showNotification('Todos los puntajes han sido reiniciados', 'info');
                }
            } else {
                throw new Error('Error al reiniciar puntajes');
            }
        } catch (error) {
            console.error('Error al reiniciar puntajes:', error);
            showNotification('Error al reiniciar puntajes', 'error');
        }
    }
}

// Función para mostrar historial de miembro
function showMemberHistory(memberId) {
    const member = teamMembers.find(m => m.id === memberId);
    const modal = document.getElementById('member-history-modal');
    const titleSpan = document.getElementById('member-history-name');
    const historyList = document.getElementById('member-history-list');
    
    titleSpan.textContent = member.name;
    
    // Filtrar historial del miembro
    const memberHistory = history.filter(entry => entry.memberId === memberId);
    
    if (memberHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No hay cambios registrados para este miembro.</p>';
    } else {
        historyList.innerHTML = memberHistory.map(entry => `
            <div class="member-history-item ${entry.type}">
                <div class="member-history-time">${entry.timeString}</div>
                <div class="member-history-text">${entry.memberName}</div>
                <div class="member-history-points">${entry.points > 0 ? '+' : ''}${entry.points} puntos</div>
                <div class="member-history-assigned" style="color: ${entry.assignedByColor}">
                    <i class="fas fa-user"></i> ${entry.assignedBy}
                </div>
                ${entry.comment ? `<div class="member-history-comment">"${entry.comment}"</div>` : ''}
            </div>
        `).join('');
    }
    
    modal.style.display = 'block';
}

// Función para cerrar modal de historial de miembro
function closeMemberHistoryModal() {
    const modal = document.getElementById('member-history-modal');
    modal.style.display = 'none';
}

// Funciones comentadas - Paneles removidos
/*
// Función para alternar panel de estadísticas
function toggleStats() {
    const statsPanel = document.getElementById('detailed-stats-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const historyPanel = document.getElementById('history-panel');
    
    if (statsPanel.style.display === 'block') {
        statsPanel.style.display = 'none';
    } else {
        statsPanel.style.display = 'block';
        settingsPanel.style.display = 'none';
        historyPanel.style.display = 'none';
    }
}

// Función para alternar panel de configuración
function toggleSettings() {
    const settingsPanel = document.getElementById('settings-panel');
    const statsPanel = document.getElementById('detailed-stats-panel');
    const historyPanel = document.getElementById('history-panel');
    
    if (settingsPanel.style.display === 'block') {
        settingsPanel.style.display = 'none';
    } else {
        settingsPanel.style.display = 'block';
        statsPanel.style.display = 'none';
        historyPanel.style.display = 'none';
    }
}

// Función para alternar panel de historial
function toggleHistory() {
    const historyPanel = document.getElementById('history-panel');
    const statsPanel = document.getElementById('detailed-stats-panel');
    const settingsPanel = document.getElementById('settings-panel');
    
    if (historyPanel.style.display === 'block') {
        historyPanel.style.display = 'none';
    } else {
        historyPanel.style.display = 'block';
        statsPanel.style.display = 'none';
        settingsPanel.style.display = 'none';
        updateHistoryDisplay();
    }
}
*/

// Función para actualizar display del historial
function updateHistoryDisplay(filter = 'all') {
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.6); font-style: italic;">No hay cambios registrados.</p>';
        return;
    }
    
    let filteredHistory = history;
    
    if (filter === 'add') {
        filteredHistory = history.filter(entry => entry.type === 'add');
    } else if (filter === 'subtract') {
        filteredHistory = history.filter(entry => entry.type === 'subtract');
    }
    
    historyList.innerHTML = filteredHistory.map(entry => `
        <div class="history-item ${entry.type}">
            <div class="history-time">${entry.timeString}</div>
            <div class="history-text">${entry.memberName}</div>
            <div class="history-points">${entry.points > 0 ? '+' : ''}${entry.points} puntos</div>
            <div class="history-assigned" style="color: ${entry.assignedByColor}">
                <i class="fas fa-user"></i> ${entry.assignedBy}
            </div>
            ${entry.comment ? `<div class="member-history-comment">"${entry.comment}"</div>` : ''}
        </div>
    `).join('');
}

// Función para filtrar historial
function filterHistory(filter) {
    // Actualizar botones activos
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateHistoryDisplay(filter);
}

// Función comentada - Botón de limpiar historial removido
/*
// Función para limpiar historial
async function clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
        try {
            const response = await fetch('/api/history', {
                method: 'DELETE'
            });

            if (response.ok) {
                history = [];
                updateHistoryDisplay();
                
                if (settings.showNotifications) {
                    showNotification('Historial limpiado correctamente', 'info');
                }
            } else {
                throw new Error('Error al limpiar historial');
            }
        } catch (error) {
            console.error('Error al limpiar historial:', error);
            showNotification('Error al limpiar historial', 'error');
        }
    }
}
*/

// Función comentada - Panel de configuración removido
/*
// Función para guardar configuración
async function saveSettings() {
    settings.defaultAddPoints = parseInt(document.getElementById('default-add-points').value) || 1;
    settings.defaultSubtractPoints = parseInt(document.getElementById('default-subtract-points').value) || 1;
    settings.autoSave = document.getElementById('auto-save').checked;
    settings.showNotifications = document.getElementById('show-notifications').checked;
    
    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            if (settings.showNotifications) {
                showNotification('Configuración guardada correctamente', 'success');
            }
        } else {
            throw new Error('Error al guardar configuración');
        }
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        showNotification('Error al guardar configuración', 'error');
    }
    
    toggleSettings();
}
*/

// Función comentada - Panel de configuración removido
/*
// Función para cargar configuración
function loadSettings() {
    document.getElementById('default-add-points').value = settings.defaultAddPoints;
    document.getElementById('default-subtract-points').value = settings.defaultSubtractPoints;
    document.getElementById('auto-save').checked = settings.autoSave;
    document.getElementById('show-notifications').checked = settings.showNotifications;
}
*/

// Función comentada - Botón de exportar datos removido
/*
// Función para exportar datos
function exportData() {
    // Convertir el array a objeto para compatibilidad
    const scoresObject = {};
    teamMembers.forEach(member => {
        scoresObject[member.id] = { name: member.name, score: member.score };
    });
    
    const data = {
        teamMembers: scoresObject,
        history: history,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roci-points-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (settings.showNotifications) {
        showNotification('Datos exportados correctamente', 'success');
    }
}
*/

// Función comentada - Botón de importar datos removido
/*
// Función para importar datos
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.teamMembers && data.history) {
                        // Actualizar los scores de los miembros existentes
                        teamMembers.forEach(member => {
                            if (data.teamMembers[member.id]) {
                                member.score = data.teamMembers[member.id].score || 0;
                            }
                        });
                        history = data.history;
                        
                        if (data.settings) {
                            settings = { ...settings, ...data.settings };
                        }
                        
                        updateDisplay();
                        updateStats();
                        updateDetailedStats();
                        updateRankings();
                        loadSettings();
                        
                        if (settings.autoSave) {
                            saveScores();
                        }
                        
                        if (settings.showNotifications) {
                            showNotification('Datos importados correctamente', 'success');
                        }
                    } else {
                        throw new Error('Formato de archivo inválido');
                    }
                } catch (error) {
                    if (settings.showNotifications) {
                        showNotification('Error al importar datos: ' + error.message, 'error');
                    }
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}
*/

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para cargar datos desde la API
async function loadDataFromAPI() {
    try {
        console.log('🔄 Cargando datos desde la API...');
        
        // Cargar miembros
        const membersResponse = await fetch('/api/members');
        if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            teamMembers = membersData;
            console.log('✅ Miembros cargados:', teamMembers.length);
        }
        
        // Cargar historial
        const historyResponse = await fetch('/api/history');
        if (historyResponse.ok) {
            history = await historyResponse.json();
            console.log('✅ Historial cargado:', history.length, 'entradas');
        }
        
        // Cargar configuración
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            settings = settingsData;
            console.log('✅ Configuración cargada');
        }
        
        // Actualizar la interfaz
        updateDisplay();
        updateRankings();
        updateLeaders();
        
        console.log('✅ Todos los datos cargados correctamente');
        
    } catch (error) {
        console.error('❌ Error al cargar datos desde la API:', error);
        showNotification('Error al cargar datos desde el servidor', 'error');
    }
}

// Add wow effects functions
function createConfetti() {
    console.log('createConfetti llamado');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        const particle = {
            x: Math.random() * window.innerWidth,
            y: -10,
            vx: (Math.random() - 0.5) * 4, // Más lento
            vy: Math.random() * 2 + 1, // Más lento
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 6, // Más grande
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5, // Más lento
            life: 1, // Vida del confeti
            decay: Math.random() * 0.005 + 0.002 // Decay más lento
        };
        confettiParticles.push(particle);
    }
    
    console.log('Confeti creado, iniciando animación...');
    animateConfetti();
}

function animateConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const particle = confettiParticles[i];
        
        // Update position and life
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.life -= particle.decay;
        
        // Remove particles that are off screen or dead
        if (particle.y > window.innerHeight + 50 || particle.x < -20 || particle.x > window.innerWidth + 20 || particle.life <= 0) {
            confettiParticles.splice(i, 1);
            continue;
        }
        
        // Draw particle with fade effect
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
        ctx.restore();
    }
    
    // Continue animation if there are particles
    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

function createFlames() {
    console.log('createFlames llamado');
    const flameCount = 80;
    
    for (let i = 0; i < flameCount; i++) {
        const particle = {
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10,
            vx: (Math.random() - 0.5) * 3, // Más lento
            vy: -Math.random() * 2 - 1, // Más lento
            color: `hsl(${Math.random() * 30 + 15}, 100%, ${Math.random() * 30 + 50}%)`,
            size: Math.random() * 20 + 15, // Más grande
            life: 1,
            decay: Math.random() * 0.008 + 0.004 // Decay más lento
        };
        flameParticles.push(particle);
    }
    
    console.log('Llamas creadas, iniciando animación...');
    animateFlames();
}

function animateFlames() {
    const canvas = document.getElementById('flame-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = flameParticles.length - 1; i >= 0; i--) {
        const particle = flameParticles[i];
        
        // Update position and life
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        
        // Remove dead particles
        if (particle.life <= 0 || particle.y < -20) {
            flameParticles.splice(i, 1);
            continue;
        }
        
        // Draw flame particle with glow effect
        ctx.save();
        ctx.globalAlpha = particle.life;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * particle.life * 2);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color.replace('100%', '80%'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Core flame
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Continue animation if there are particles
    if (flameParticles.length > 0) {
        requestAnimationFrame(animateFlames);
    }
}

function triggerWowEffect(type) {
    console.log('triggerWowEffect llamado con tipo:', type);
    
    if (type === 'add') {
        console.log('Creando confeti...');
        createConfetti();
        showNotification('¡Puntos agregados! 🎉', 'success');
    } else if (type === 'subtract') {
        console.log('Creando llamas...');
        createFlames();
        showNotification('¡Puntos restados! 🔥', 'warning');
    }
}

// Función para limpiar localStorage (para debugging)
function clearLocalStorage() {
    localStorage.removeItem('rociPointsScores');
    localStorage.removeItem('rociPointsHistory');
    localStorage.removeItem('rociPointsSettings');
    console.log('localStorage limpiado');
    location.reload();
}

// Función para calcular nivel basado en puntos
function calculateLevel(points) {
    if (points < 0) return 'Principiante';
    if (points < 50) return 'Novato';
    if (points < 100) return 'Intermedio';
    if (points < 200) return 'Avanzado';
    if (points < 500) return 'Experto';
    return 'Maestro';
}

function calculateCurrentLeader() {
    let currentLeader = null;
    let maxScore = -Infinity;
    
    teamMembers.forEach(member => {
        if (member.score > maxScore) {
            maxScore = member.score;
            currentLeader = member.name;
        }
    });
    
    return currentLeader;
}

function calculateMonthlyLeader() {
    // Función comentada - Líder del Mes removido
    /*
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyHistory = history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    const monthlyPoints = {};
    monthlyHistory.forEach(entry => {
        if (!monthlyPoints[entry.member]) {
            monthlyPoints[entry.member] = 0;
        }
        monthlyPoints[entry.member] += entry.points;
    });
    
    let monthlyLeader = null;
    let maxMonthlyPoints = -Infinity;
    
    for (const [member, points] of Object.entries(monthlyPoints)) {
        if (points > maxMonthlyPoints) {
            maxMonthlyPoints = points;
            monthlyLeader = member;
        }
    }
    
    return monthlyLeader;
    */
}

function calculateHistoricalLeader() {
    const totalPoints = {};
    
    history.forEach(entry => {
        if (!totalPoints[entry.member]) {
            totalPoints[entry.member] = 0;
        }
        totalPoints[entry.member] += entry.points;
    });
    
    let historicalLeader = null;
    let maxTotalPoints = -Infinity;
    
    for (const [member, points] of Object.entries(totalPoints)) {
        if (points > maxTotalPoints) {
            maxTotalPoints = points;
            historicalLeader = member;
        }
    }
    
    return historicalLeader;
}

function updateLeaders() {
    const currentLeader = calculateCurrentLeader();
    // const monthlyLeader = calculateMonthlyLeader(); // Removido
    const historicalLeader = calculateHistoricalLeader();
    
    document.getElementById('current-leader-name').textContent = currentLeader || '-';
    // document.getElementById('monthly-leader-name').textContent = monthlyLeader || '-'; // Removido
    document.getElementById('historical-leader-name').textContent = historicalLeader || '-';
}

console.log('🚀 RociPoints - Sistema de Puntos del Equipo');
console.log('👥 Miembros: Rocío, Javiera, Juan Felipe, Daniel, Alvaro');
console.log('🎯 Puntos disponibles: -5, -3, -1, +1, +3, +5');
console.log('💾 Datos guardados automáticamente en localStorage');
console.log('📊 Estadísticas en tiempo real');
console.log('🎨 Diseño moderno y responsivo');
console.log('🔧 Para limpiar localStorage: clearLocalStorage()'); 