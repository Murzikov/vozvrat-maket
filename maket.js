// Кликабельный макет системы возвратов. Данные выдуманные; всё, что вы делаете,
// происходит только в этом окне браузера и никуда не отправляется. После обновления страницы всё как было.
(function () {
    var PAGE = location.pathname.split('/').pop() || 'index.html';
    var IS_CLIENT = PAGE.indexOf('client-') === 0;
    var ME = IS_CLIENT ? 'ООО Автодеталь-Плюс' : 'Демо Администратор';

    // ---------- общие мелочи ----------
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function now() {
        var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
        return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }
    function toast(text) {
        var box = $('#maket-toast');
        if (!box) {
            box = document.createElement('div');
            box.id = 'maket-toast';
            box.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:100;max-width:90vw;' +
                'padding:10px 16px;border-radius:12px;background:#111827;color:#fff;font:600 14px Inter,sans-serif;' +
                'box-shadow:0 8px 24px rgba(0,0,0,.18);transition:opacity .2s;opacity:0;pointer-events:none';
            document.body.appendChild(box);
        }
        box.textContent = text;
        box.style.opacity = '1';
        clearTimeout(box._timer);
        box._timer = setTimeout(function () { box.style.opacity = '0'; }, 2200);
    }
    function flash(id, text) { var s = document.getElementById(id); if (s) { s.textContent = text || 'Сохранено'; } }
    function show(node, on) { if (node) node.classList.toggle('hidden', !on); }

    // ---------- просмотр фото ----------
    function openPhoto(src) {
        var layer = el('<div style="position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out"></div>');
        var img = el('<img alt="" style="max-width:100%;max-height:90vh;border-radius:16px;background:#fff">');
        img.src = src;
        layer.appendChild(img);
        layer.addEventListener('click', function () { layer.remove(); });
        document.addEventListener('keydown', function close(e) {
            if (e.key === 'Escape') { layer.remove(); document.removeEventListener('keydown', close); }
        });
        document.body.appendChild(layer);
    }

    // ---------- статус ----------
    var STATUSES = (PAGE.indexOf('requests-') === 0 || PAGE.indexOf('client-requests-') === 0) ? [
        ['Получен', 'bg-blue-100 text-blue-700', 'bg-blue-50 text-blue-700 hover:bg-blue-100'],
        ['В работе', 'bg-amber-100 text-amber-700', 'bg-amber-50 text-amber-800 hover:bg-amber-100'],
        ['Завершён', 'bg-green-100 text-green-700', 'bg-green-50 text-green-700 hover:bg-green-100']
    ] : [
        ['Получен', 'bg-blue-100 text-blue-700', 'bg-blue-50 text-blue-700 hover:bg-blue-100'],
        ['Согласован', 'bg-green-100 text-green-700', 'bg-green-50 text-green-700 hover:bg-green-100'],
        ['Отказано', 'bg-red-100 text-red-700', 'bg-red-50 text-red-700 hover:bg-red-100'],
        ['Ожидаем деталь', 'bg-amber-100 text-amber-700', 'bg-amber-50 text-amber-800 hover:bg-amber-100'],
        ['Архив', 'bg-gray-100 text-gray-600', 'bg-gray-900 text-white hover:bg-black', 'В архив']
    ];
    function setStatus(section, label) {
        var spans = $$('span', section);
        var badge = spans[1];
        var conf = STATUSES.filter(function (s) { return s[0] === label; })[0];
        if (!badge || !conf) return;
        badge.textContent = label;
        badge.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ' + conf[1];
        $$('button', section).forEach(function (b) { b.remove(); });
        STATUSES.forEach(function (s) {
            if (s[0] === label) return;
            var b = el('<button type="button" class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ' + s[2] + '"></button>');
            b.textContent = s[3] || s[0];
            b.dataset.status = s[0];
            section.appendChild(b);
        });
        toast('Статус изменён на «' + label + '»');
    }
    $$('#status-section button').forEach(function (b) {
        var text = b.textContent.trim();
        b.dataset.status = text === 'В архив' ? 'Архив' : text;
    });

    // ---------- чат и комментарии ----------
    function addChatMessage(text) {
        var box = $('#chat-messages');
        if (!box) return;
        var list = $('.space-y-3', box);
        if (!list) { box.innerHTML = ''; list = el('<div class="space-y-3"></div>'); box.appendChild(list); }
        list.appendChild(el('<div class="chat-item flex flex-col items-end" data-search="' + esc((text + ' ' + ME).toLowerCase()) + '">' +
            '<div class="bg-black text-white rounded-2xl px-3.5 py-2.5 max-w-[85%]"><p class="text-xs leading-relaxed whitespace-pre-wrap break-words">' + esc(text) + '</p></div>' +
            '<div class="flex items-center gap-1.5 mt-1 px-1"><span class="text-[10px] text-gray-500">' + esc(ME) + '</span>' +
            '<span class="text-[10px] text-gray-300">·</span><span class="text-[10px] text-gray-500">' + now() + '</span></div></div>'));
        box.scrollTop = box.scrollHeight;
    }
    function addComment(text) {
        var box = $('#comments-list');
        if (!box) return;
        var list = $('.space-y-2', box);
        if (!list) { box.innerHTML = ''; list = el('<div class="space-y-2"></div>'); box.appendChild(list); }
        list.appendChild(el('<div class="comment-item flex flex-col items-end" data-search="' + esc((text + ' ' + ME).toLowerCase()) + '">' +
            '<div class="bg-amber-50 text-gray-800 rounded-xl px-3 py-2 max-w-[95%]"><p class="text-xs leading-relaxed whitespace-pre-wrap break-words">' + esc(text) + '</p></div>' +
            '<div class="flex items-center gap-1.5 mt-0.5 px-1"><span class="text-[10px] text-gray-500">' + esc(ME) + '</span>' +
            '<span class="text-[10px] text-gray-300">·</span><span class="text-[10px] text-gray-500">' + now() + '</span></div></div>'));
        box.scrollTop = box.scrollHeight;
    }
    function searchIn(boxSel, itemSel, query, emptyId) {
        var q = query.trim().toLowerCase(), shown = 0;
        $$(itemSel, $(boxSel)).forEach(function (item) {
            var on = !q || (item.dataset.search || item.textContent.toLowerCase()).indexOf(q) !== -1;
            item.classList.toggle('hidden', !on);
            if (on) shown++;
        });
        show(document.getElementById(emptyId), q && !shown);
    }

    // ---------- файлы ----------
    function fileTile(name, size, url) {
        var thumb = url
            ? '<button type="button" class="attachment-thumb rounded-xl overflow-hidden shrink-0 ring-1 ring-gray-200" data-preview="' + url + '"><img src="' + url + '" alt="" class="w-full h-full object-cover"></button>'
            : '<div class="attachment-thumb rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0"><span class="text-[10px] font-bold mono">' + esc(name.split('.').pop().toUpperCase().slice(0, 4)) + '</span></div>';
        return el('<div class="attachment-row" title="' + esc(name) + '">' + thumb +
            '<div class="attachment-info"><p class="attachment-name">' + esc(name) + '</p><p class="attachment-size">' + size + '</p></div>' +
            '<div class="attachment-actions"><button type="button" data-act="file-delete" class="attachment-action text-gray-600 hover:text-red-600" title="Удалить" aria-label="Удалить">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
            '</button></div></div>');
    }
    function humanSize(n) { return n > 1048576 ? Math.round(n / 1048576) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
    function addFiles(input) {
        var target;
        if (input.dataset.internal === 'true') target = $('#internal-files-list');
        else target = $('#files-list') || $('#client-files-list');
        if (!target) return false;
        var list = target.classList.contains('attachment-list') ? target : $('.attachment-list', target);
        if (!list) { target.innerHTML = ''; list = el('<div class="attachment-list"></div>'); target.appendChild(list); }
        $$('p', list).forEach(function (p) { if (!p.closest('.attachment-row')) p.remove(); });
        Array.prototype.forEach.call(input.files, function (f) {
            var url = /^image\//.test(f.type) ? URL.createObjectURL(f) : '';
            list.appendChild(fileTile(f.name, humanSize(f.size), url));
        });
        toast('Файл добавлен');
        return true;
    }
    function previewInForm(input) {
        var grid = $('#file-preview');
        if (!grid) return false;
        Array.prototype.forEach.call(input.files, function (f) {
            var cell = el('<div class="relative rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gray-50 aspect-square flex items-center justify-center"></div>');
            if (/^image\//.test(f.type)) cell.appendChild(el('<img alt="" class="w-full h-full object-cover" src="' + URL.createObjectURL(f) + '">'));
            else cell.appendChild(el('<span class="text-[11px] font-semibold text-gray-600 px-2 text-center break-all">' + esc(f.name) + '</span>'));
            grid.appendChild(cell);
        });
        return true;
    }

    // ---------- списки: фильтры и поиск ----------
    function cellText(row, n) { var c = row.children[n - 1]; return c ? c.textContent.toLowerCase() : ''; }
    function filterRows(tbodySel, checks) {
        var rows = $$(tbodySel + ' tr').filter(function (r) { return !r.querySelector('td[colspan]'); });
        var shown = 0;
        rows.forEach(function (r) {
            var on = checks.every(function (c) { return !c.value || cellText(r, c.col).indexOf(c.value) !== -1; });
            r.classList.toggle('hidden', !on);
            if (on) shown++;
        });
        var empty = $('#maket-empty');
        if (!shown && rows.length) {
            if (!empty) $(tbodySel).appendChild(el('<tr id="maket-empty"><td colspan="7" class="py-10 text-center text-gray-500 text-sm">Ничего не найдено</td></tr>'));
        } else if (empty) empty.remove();
    }
    function value(name) { var f = $('[name="' + name + '"]'); return f ? f.value.trim().toLowerCase() : ''; }
    function dateValue() {
        var v = value('date');
        if (!v) return '';
        var p = v.split('-');
        return p[2] + '.' + p[1] + '.' + p[0];
    }
    function filterRefunds() {
        var sup = $('[name="supplier_id"]');
        filterRows('#refunds-tbody', [
            { col: 2, value: value('client_name') }, { col: 3, value: value('article') },
            { col: 2, value: sup && sup.value ? sup.options[sup.selectedIndex].text.toLowerCase() : '' },
            { col: 1, value: dateValue() }]);
    }
    function filterRequests() {
        var st = $('[name="status"]'), ex = $('[name="executor_id"]');
        filterRows('#requests-tbody', [
            { col: 2, value: value('client_name') }, { col: 3, value: value('article') },
            { col: 5, value: st && st.value ? st.options[st.selectedIndex].text.toLowerCase() : '' },
            { col: 4, value: ex && ex.value ? ex.options[ex.selectedIndex].text.toLowerCase() : '' },
            { col: 1, value: dateValue() }]);
    }
    function filterPeople() {
        var q = ($('#search-input') || { value: '' }).value.trim().toLowerCase();
        var role = ($('#role-filter') || { value: '' }).value;
        var shown = 0;
        $$('.client-row, .user-row').forEach(function (r) {
            var text = [r.dataset.name, r.dataset.email, r.dataset.ids].join(' ');
            var on = (!q || text.indexOf(q) !== -1) && (!role || r.dataset.role === role);
            r.classList.toggle('hidden', !on);
            if (on) shown++;
        });
        show($('#no-results'), !shown);
    }

    // ---------- клики ----------
    var SAVE_NOTE = 'Это макет: в рабочей системе здесь сохраняется действие';
    document.addEventListener('click', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-close-self')) { t.classList.add('hidden'); t.classList.remove('flex'); return; }
        var photo = t.closest('[data-preview]');
        if (photo) { e.preventDefault(); openPhoto(photo.getAttribute('data-preview')); return; }
        if (t.closest('[data-maket-menu]')) {
            var opening = sidebar.classList.contains('hidden');
            show(sidebar, opening);
            // На телефоне открытое меню во весь рост, плашка иначе легла бы на кнопку выхода.
            if (!wide.matches) bar.style.display = opening ? 'none' : 'flex';
            return;
        }
        var note = t.closest('[data-maket]');
        if (note) { e.preventDefault(); toast(note.getAttribute('data-maket')); return; }
        var row = t.closest('tr[data-href]');
        if (row && !t.closest('a,button')) { location.href = row.getAttribute('data-href'); return; }

        var statusBtn = t.closest('#status-section button');
        if (statusBtn) { setStatus($('#status-section'), statusBtn.dataset.status); return; }

        var actEl = t.closest('[data-act]');
        var act = actEl ? actEl.getAttribute('data-act') : '';
        if (act) {
            e.preventDefault();
            var arg = act.slice(act.indexOf(':') + 1);
            if (act.indexOf('note:') === 0) return toast(arg);
            if (act.indexOf('open:') === 0) { var m = document.getElementById(arg); m.classList.remove('hidden'); m.classList.add('flex'); return; }
            if (act.indexOf('close:') === 0) { var c = document.getElementById(arg); c.classList.add('hidden'); c.classList.remove('flex'); return; }
            if (act.indexOf('toggle:') === 0) {
                var d = document.getElementById(arg);
                var content = d && $('[id$="-bell-content"]', d);
                if (content && !content.textContent.trim()) content.innerHTML = '<p class="px-4 py-6 text-center text-xs text-gray-500">Новых уведомлений нет</p>';
                return show(d, d.classList.contains('hidden'));
            }
            if (act.indexOf('pick:') === 0) { var inp = document.getElementById(arg); if (inp) inp.click(); return; }
            switch (act) {
                case 'reason-toggle':
                    var form = $('#reason-edit-form'), open = form.classList.contains('hidden');
                    show(form, open); show($('#reason-display'), !open);
                    $('#reason-edit-btn').textContent = open ? 'Отмена' : 'Изменить';
                    return;
                case 'reason-save':
                    var txt = $('#reason-textarea').value.trim();
                    $('#reason-display').innerHTML = txt ? '<p class="text-sm text-gray-900 whitespace-pre-line">' + esc(txt) + '</p>' : '<p class="text-xs text-gray-400">Не указана</p>';
                    show($('#reason-edit-form'), false); show($('#reason-display'), true);
                    $('#reason-edit-btn').textContent = 'Изменить';
                    return toast('Причина сохранена');
                case 'cids-toggle':
                    var wrap = $('#card-cids'), expanded = wrap.dataset.expanded === 'true';
                    $$('.card-cid-extra', wrap).forEach(function (x) { show(x, !expanded); });
                    wrap.dataset.expanded = expanded ? 'false' : 'true';
                    actEl.textContent = expanded ? 'Показать ещё' : 'Скрыть';
                    return;
                case 'client-take':
                case 'client-release':
                    var tr = actEl.closest('tr');
                    var take = act === 'client-take';
                    tr.children[1].innerHTML = take ? '<span class="text-blue-600 font-semibold text-sm">Вы</span>' : '<span class="text-amber-700 text-sm">не назначен</span>';
                    tr.children[2].innerHTML = take
                        ? '<button data-act="client-release" class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors text-red-700 bg-red-50 hover:bg-red-100">Открепить</button>'
                        : '<button data-act="client-take" class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors text-blue-800 bg-blue-100 hover:bg-blue-200">Взять себе</button>';
                    return toast(take ? 'Клиент закреплён за вами' : 'Клиент откреплён');
                case 'file-delete':
                    if (confirm('Удалить файл?')) { actEl.closest('.attachment-row').remove(); toast('Файл удалён'); }
                    return;
                case 'notes-save': flash('notes-status'); return toast('Заметка сохранена');
                case 'upd-save': flash('upd-status'); return toast('Номер УПД сохранён');
                case 'executor-save': flash('executor-status'); return toast('Исполнитель назначен');
                case 'subject-save': flash('subject-text-status'); return toast('Тема сохранена');
                case 'supplier-save':
                    var sel = $('#assign-supplier-select');
                    var name = sel.value ? sel.options[sel.selectedIndex].text : 'не выбран';
                    var label = $('#assign-supplier-form').previousElementSibling;
                    var span = label && $$('span', label).pop();
                    if (span) span.textContent = name;
                    return toast('Поставщик сохранён');
                case 'clear-filters':
                    $('#search-input').value = ''; $('#role-filter').value = ''; return filterPeople();
                case 'saved': return toast('Сохранено');
            }
            return toast(SAVE_NOTE);
        }
        if (t.closest('#refunds-results button, #requests-results button')) { e.preventDefault(); return toast('В макете показана только первая страница списка'); }
        var delClient = t.closest('#client-files-list button[title^="Удалить"]');
        if (delClient) { if (confirm('Удалить файл?')) { delClient.closest('.attachment-row').remove(); toast('Файл удалён'); } return; }
        var button = t.closest('button');
        if (button && !(button.type === 'submit' && button.form)) { e.preventDefault(); toast(SAVE_NOTE); }
    });

    // ---------- отправка форм ----------
    document.addEventListener('submit', function (e) {
        e.preventDefault();
        var form = e.target;
        if (form.id === 'login-form') { location.href = 'statistics.html'; return; }
        if (form.hasAttribute('data-maket-logout')) { location.href = 'index.html'; return; }
        if (form.id === 'chat-form') {
            var input = $('#chat-input');
            if (input.value.trim()) { addChatMessage(input.value.trim()); input.value = ''; }
            return;
        }
        if (form.id === 'comment-form') {
            var ci = $('#comment-input');
            if (ci.value.trim()) { addComment(ci.value.trim()); ci.value = ''; }
            return;
        }
        if (form.id === 'assign-supplier-form') return;
        if (/-create\.html$/.test(PAGE)) {
            var back = PAGE.replace('-create.html', '.html');
            var what = PAGE.indexOf('requests') !== -1 ? 'Запрос отправлен' : 'Возврат создан';
            toast(what + '. В макете он не сохраняется, возвращаю к списку');
            setTimeout(function () { location.href = back; }, 1600);
            return;
        }
        toast(SAVE_NOTE);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'chat-input') {
            e.preventDefault();
            $('#chat-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    });

    // ---------- поля ----------
    document.addEventListener('change', function (e) {
        var t = e.target;
        if (t.matches('input[type=file]')) {
            var done = addFiles(t) || previewInForm(t);
            if (!done) toast('Это макет: файлы здесь не загружаются');
            t.value = '';
            return;
        }
        if (t.name === 'subject') { show($('#subject-text-wrap'), t.value === 'free'); return; }
        if (t.closest('#refunds-tbody') || t.closest('#requests-tbody')) return;
        // Список по статусу снят отдельной страницей: завершённые и архивные запросы система показывает только так.
        var section = PAGE.indexOf('refunds') === 0 ? 'refunds' : PAGE.indexOf('requests') === 0 ? 'requests' : '';
        if (section && t.name === 'status') {
            location.href = t.value ? section + '-status-' + t.value + '.html' : section + '.html';
            return;
        }
        if ($('#refunds-tbody') && t.name) {
            if (t.name === 'manager_id' && t.value) toast('Фильтр по менеджеру в макете не работает, показаны все');
            return filterRefunds();
        }
        if ($('#requests-tbody') && t.name) {
            if (t.name === 'manager_id' && t.value) toast('Фильтр по менеджеру в макете не работает, показаны все');
            return filterRequests();
        }
        if (t.id === 'role-filter') return filterPeople();
        if (t.id === 'assign-client-select' || t.id === 'executor-select' || t.id === 'assign-supplier-select') return;
    });
    var noteTimer;
    document.addEventListener('input', function (e) {
        var t = e.target;
        if (t.id === 'chat-search') return searchIn('#chat-messages', '.chat-item', t.value, 'chat-no-results');
        if (t.id === 'comments-search') return searchIn('#comments-list', '.comment-item', t.value, 'comments-no-results');
        if (t.id === 'search-input') return filterPeople();
        if (t.id === 'notes-input') { flash('notes-status', 'Сохраняю...'); clearTimeout(noteTimer); noteTimer = setTimeout(function () { flash('notes-status'); }, 700); return; }
        if (t.name === 'order_id' && ($('#refunds-tbody') || $('#requests-tbody'))) {
            if (t.value.length === 1) toast('ID заказа в списке не показан, поиск по нему работает только в системе');
            return;
        }
        if ($('#refunds-tbody') && t.name) return filterRefunds();
        if ($('#requests-tbody') && t.name) return filterRequests();
    });

    // ---------- плашка макета и вход ----------
    var bar = el('<div id="maket-bar"><span style="padding:6px 8px">Макет, данные выдуманные</span>' +
        '<a href="statistics.html" style="padding:6px 10px;border-radius:8px;text-decoration:none;' + (IS_CLIENT ? 'background:#f3f4f6;color:#111827' : 'background:#111827;color:#fff') + '">Сотрудник</a>' +
        '<a href="client-refunds.html" style="padding:6px 10px;border-radius:8px;text-decoration:none;' + (IS_CLIENT ? 'background:#111827;color:#fff' : 'background:#f3f4f6;color:#111827') + '">Клиент</a></div>');
    var BAR_LOOK = 'display:flex;gap:4px;align-items:center;padding:4px;border-radius:12px;font:600 12px Inter,sans-serif;color:#374151;';
    var sidebar = $('#main-sidebar');
    var wide = window.matchMedia('(min-width: 768px)');
    // На компьютере плашка стоит в меню над блоком пользователя и ничего не закрывает, на телефоне висит внизу экрана.
    function placeBar() {
        var userBlock = sidebar && sidebar.lastElementChild;
        if (wide.matches && userBlock) {
            bar.style.cssText = BAR_LOOK + 'flex-wrap:wrap;margin:0 16px 12px;background:#f9fafb';
            sidebar.insertBefore(bar, userBlock);
        } else {
            bar.style.cssText = BAR_LOOK + 'position:fixed;left:12px;bottom:12px;z-index:80;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.14)';
            document.body.appendChild(bar);
        }
    }
    placeBar();
    if (wide.addEventListener) wide.addEventListener('change', placeBar);
    var main = $('main');
    if (main) main.style.paddingBottom = '64px';

    var login = $('#login-form');
    if (login) {
        var asClient = el('<a href="client-refunds.html" style="display:block;margin-top:10px;padding:10px;border-radius:12px;background:#f3f4f6;color:#111827;' +
            'text-align:center;font:600 14px Inter,sans-serif;text-decoration:none">Войти как клиент</a>');
        login.appendChild(asClient);
        $$('input', login).forEach(function (i) { i.removeAttribute('required'); });
        var email = $('input[name=email]', login);
        if (email) email.value = 'admin@demo.local';
    }

    ['chat-messages', 'comments-list'].forEach(function (id) {
        var box = document.getElementById(id);
        if (box) box.scrollTop = box.scrollHeight;
    });
})();
