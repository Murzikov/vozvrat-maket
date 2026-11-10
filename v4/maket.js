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
                'padding:10px 16px;border-radius:12px;background:#2F2E2D;color:#fff;font:600 14px Inter,sans-serif;' +
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
    // Как в системе: [название, цвет плашки, цвет кнопки, иконка, группа (1 справа, отдельно от согласования), подпись кнопки].
    var ICON = {
        ok: 'M5 13l4 4L19 7', wait: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', back: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
        no: 'M6 18L18 6M6 6l12 12', box: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        work: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'
    };
    var STATUSES = (PAGE.indexOf('requests-') === 0 || PAGE.indexOf('client-requests-') === 0) ? [
        ['В работе', 'bg-amber-100 text-amber-800', 'bg-amber-400 text-gray-900 hover:bg-amber-300', ICON.work, 0],
        ['Завершён', 'bg-green-100 text-green-800', 'bg-green-700 text-white hover:bg-green-800', ICON.ok, 0],
        ['Получен', 'bg-blue-100 text-blue-800', 'bg-white text-blue-800 ring-1 ring-inset ring-blue-300 hover:bg-blue-50', ICON.back, 0]
    ] : [
        ['Согласован', 'bg-green-100 text-green-800', 'bg-green-700 text-white hover:bg-green-800', ICON.ok, 0],
        ['Ожидаем деталь', 'bg-amber-100 text-amber-800', 'bg-amber-400 text-gray-900 hover:bg-amber-300', ICON.wait, 0],
        ['В работе', 'bg-cyan-100 text-cyan-800', 'bg-white text-cyan-800 ring-1 ring-inset ring-cyan-300 hover:bg-cyan-50', ICON.work, 0],
        ['Получен', 'bg-blue-100 text-blue-800', 'bg-white text-blue-800 ring-1 ring-inset ring-blue-300 hover:bg-blue-50', ICON.back, 0],
        ['Отказано', 'bg-red-100 text-red-800', 'bg-red-600 text-white hover:bg-red-700', ICON.no, 1],
        ['Архив', 'bg-gray-200 text-gray-700', 'bg-white text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-100', ICON.box, 1, 'В архив']
    ];
    function setStatus(section, label, quiet) {
        var badge = $('.relative > span', section) || $$(':scope > span', section)[1];
        var conf = STATUSES.filter(function (s) { return s[0] === label; })[0];
        if (!badge || !conf) return;
        badge.className = badge.className.replace(/\b(bg|text)-(blue|cyan|green|amber|red|violet|gray)-\d+\b/g, '').replace(/\s+/g, ' ').trim() + ' ' + conf[1];
        badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-current"></span>' + esc(label);
        // Как в системе с 10.11: кнопки стоят на своих местах, текущий статус в ряду приглушён и не нажимается.
        $$('button', section).forEach(function (b) {
            if (b.id === 'status-undo' || !b.dataset.status) return;
            var current = b.dataset.status === label;
            b.disabled = current;
            b.classList.toggle('opacity-40', current);
            b.classList.toggle('pointer-events-none', current);
        });
        if (!quiet) toast('Статус изменён на «' + label + '»');
    }
    // Как в системе с 07.11: после смены статуса возврата 5 секунд горит «Отменить» с отсчётом в кольце,
    // на нуле кнопка уезжает обратно под статус. Письмо клиенту в системе ждёт эти секунды.
    var undoTimer;
    function offerUndo(section, previous) {
        var wrap = $('.relative', section);
        if (!wrap) return;
        var old = $('#status-undo', section);
        if (old) old.remove();
        clearInterval(undoTimer);
        var btn = el('<button type="button" id="status-undo" class="status-undo z-10 inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black shadow-md whitespace-nowrap">' +
            '<svg class="undo-timer" style="--undo-seconds: 5s" viewBox="0 0 20 20" aria-hidden="true"><circle class="undo-track" cx="10" cy="10" r="8.5"/>' +
            '<circle class="undo-ring" cx="10" cy="10" r="8.5" transform="rotate(-90 10 10)"/><text class="undo-digit" x="10" y="13.64" text-anchor="middle">5</text></svg>Отменить</button>');
        btn.dataset.previous = previous;
        wrap.appendChild(btn);
        btn.style.animation = 'none';
        var box = btn.getBoundingClientRect();
        btn.style.animation = '';
        var covers = $$('#status-section button:not(#status-undo)').some(function (o) {
            var r = o.getBoundingClientRect();
            return r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top;
        });
        if (covers) btn.classList.add('is-inline');
        var left = 5, digit = $('text', btn);
        undoTimer = setInterval(function () {
            left -= 1;
            digit.textContent = Math.max(left, 0);
            if (left > 0) return;
            clearInterval(undoTimer);
            btn.classList.add('is-leaving');
            btn.addEventListener('animationend', function () { btn.remove(); }, { once: true });
        }, 1000);
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
            '<div class="bg-gray-900 text-white rounded-2xl px-3.5 py-2.5 max-w-[85%]"><p class="text-sm leading-5 whitespace-pre-wrap break-words">' + esc(text) + '</p></div>' +
            '<div class="flex items-center gap-1.5 mt-1 px-1"><span class="text-[11px] text-gray-500">' + esc(ME) + '</span>' +
            '<span class="text-[11px] text-gray-500">·</span><span class="text-[11px] text-gray-500">' + now() + '</span></div></div>'));
        box.scrollTop = box.scrollHeight;
    }
    function addComment(text) {
        var box = $('#comments-list');
        if (!box) return;
        var list = $('.space-y-2', box);
        if (!list) { box.innerHTML = ''; list = el('<div class="space-y-2"></div>'); box.appendChild(list); }
        list.appendChild(el('<div class="comment-item flex flex-col items-end" data-search="' + esc((text + ' ' + ME).toLowerCase()) + '">' +
            '<div class="bg-note-100 text-gray-900 rounded-xl px-3 py-2 max-w-[95%]"><p class="text-sm leading-5 whitespace-pre-wrap break-words">' + esc(text) + '</p></div>' +
            '<div class="flex items-center gap-1.5 mt-0.5 px-1"><span class="text-[11px] text-gray-500">' + esc(ME) + '</span>' +
            '<span class="text-[11px] text-gray-500">·</span><span class="text-[11px] text-gray-500">' + now() + '</span></div></div>'));
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
            : '<div class="attachment-thumb rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0"><span class="text-[11px] font-medium mono">' + esc(name.split('.').pop().toUpperCase().slice(0, 4)) + '</span></div>';
        return el('<div class="attachment-row" title="' + esc(name) + '">' + thumb +
            '<div class="attachment-info"><p class="attachment-name">' + esc(name) + '</p><p class="attachment-size">' + size + '</p></div>' +
            '<div class="attachment-actions"><button type="button" data-act="file-delete" class="attachment-action text-gray-600 hover:text-red-600" title="Удалить" aria-label="Удалить">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
            '</button></div></div>');
    }
    function humanSize(n) { return n > 1048576 ? Math.round(n / 1048576) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
    function addFiles(input) { return addFileList(input.files, input.dataset.internal === 'true'); }
    function addFileList(files, internal) {
        var target;
        if (internal) target = $('#internal-files-list');
        else target = $('#files-list') || $('#client-files-list');
        if (!target) return false;
        var list = target.classList.contains('attachment-list') ? target : $('.attachment-list', target);
        if (!list) { target.innerHTML = ''; list = el('<div class="attachment-list"></div>'); target.appendChild(list); }
        $$('p', list).forEach(function (p) { if (!p.closest('.attachment-row')) p.remove(); });
        Array.prototype.forEach.call(files, function (f) {
            var url = /^image\//.test(f.type) ? URL.createObjectURL(f) : '';
            list.appendChild(fileTile(f.name, humanSize(f.size), url));
        });
        toast(files.length > 1 ? 'Добавлено файлов: ' + files.length : 'Файл добавлен');
        return true;
    }
    function previewInForm(input) { return previewFiles(input.files); }
    function previewFiles(files) {
        var grid = $('#file-preview');
        if (!grid) return false;
        Array.prototype.forEach.call(files, function (f) {
            var cell = el('<div class="relative rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gray-50 aspect-square flex items-center justify-center"></div>');
            if (/^image\//.test(f.type)) cell.appendChild(el('<img alt="" class="w-full h-full object-cover" src="' + URL.createObjectURL(f) + '">'));
            else cell.appendChild(el('<span class="text-[11px] font-semibold text-gray-600 px-2 text-center break-all">' + esc(f.name) + '</span>'));
            cell.appendChild(el('<button type="button" data-act="preview-remove" title="Удалить" class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/60 text-white rounded-full hover:bg-black transition-colors">' +
                '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>'));
            grid.appendChild(cell);
        });
        return true;
    }
    // Как в системе с 10.11: фото можно перетащить в зону карточки или формы и вставить скриншот через Ctrl+V.
    $$('[data-drop-files], #file-drop').forEach(function (zone) {
        zone.addEventListener('dragover', function (e) {
            if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1) { e.preventDefault(); zone.classList.add('ring-2', 'ring-brand-500'); }
        });
        zone.addEventListener('dragleave', function (e) { if (!zone.contains(e.relatedTarget)) zone.classList.remove('ring-2', 'ring-brand-500'); });
        zone.addEventListener('drop', function (e) {
            if (!e.dataTransfer || !e.dataTransfer.files.length) return;
            e.preventDefault();
            zone.classList.remove('ring-2', 'ring-brand-500');
            if (zone.id === 'file-drop') previewFiles(e.dataTransfer.files);
            else addFileList(e.dataTransfer.files, zone.dataset.dropFiles === 'true');
        });
    });
    document.addEventListener('paste', function (e) {
        var images = Array.prototype.filter.call((e.clipboardData && e.clipboardData.files) || [], function (f) { return /^image\//.test(f.type); });
        if (!images.length) return;
        if ($('#file-preview')) { e.preventDefault(); previewFiles(images); }
        else if (e.target.closest && e.target.closest('#chat-form, #comment-form')) return;
        else if ($('#files-list')) { e.preventDefault(); addFileList(images, false); }
    });

    // ---------- списки: фильтры и поиск ----------
    function cellText(row, n) { var c = row.children[n - 1]; return c ? c.textContent.toLowerCase() : ''; }
    // В колонке «Клиент / Поставщик» клиент первой строкой: фильтр «Клиент» ищет только по нему.
    function firstLine(row, n) { var c = row.children[n - 1], f = c && c.querySelector('p'); return f ? f.textContent.toLowerCase() : cellText(row, n); }
    function filterRows(tbodySel, checks) {
        var rows = $$(tbodySel + ' tr').filter(function (r) { return !r.querySelector('td[colspan]'); });
        var shown = 0;
        rows.forEach(function (r) {
            var on = checks.every(function (c) {
                if (!c.value) return true;
                if (c.cols) return c.cols.some(function (n) { return cellText(r, n).indexOf(c.value) !== -1; });
                return (c.first ? firstLine(r, c.col) : cellText(r, c.col)).indexOf(c.value) !== -1;
            });
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
            { col: 2, value: value('client_name'), first: true }, { col: 3, value: value('article') },
            { cols: [1, 3], value: value('q').replace(/^#/, '') },
            { col: 2, value: sup && sup.value ? sup.options[sup.selectedIndex].text.toLowerCase() : '' },
            { col: 1, value: dateValue() }]);
    }
    // Совпадения из архива под таблицей, как в системе: строки архива берутся со страницы архива макета.
    var archiveRows = null;
    function archiveMatches() {
        var q = value('q').replace(/^#/, ''), box = $('#maket-archive-link');
        if (!$('input[name="q"]') || PAGE.indexOf('refunds-archive') === 0) return;
        if (!q) { if (box) box.remove(); return; }
        var count = function () {
            var n = archiveRows.filter(function (t) { return t.indexOf(q) !== -1; }).length;
            if (!n) { if (box) box.remove(); return; }
            if (!box) {
                box = el('<a id="maket-archive-link" class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-800 hover:bg-gray-100 transition-colors">' +
                    '<span>Совпадений в архиве: <span class="font-semibold tabular-nums"></span></span>' +
                    '<span class="inline-flex items-center gap-1 font-semibold text-gray-900 whitespace-nowrap">Открыть архив <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></span></a>');
                var table = $('#refunds-results table');
                table.parentNode.insertBefore(box, table.nextSibling);
            }
            $('.tabular-nums', box).textContent = n;
            box.href = 'refunds-archive.html?q=' + encodeURIComponent($('input[name="q"]').value.trim());
        };
        if (archiveRows) return count();
        fetch('refunds-archive.html').then(function (r) { return r.text(); }).then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            archiveRows = Array.prototype.slice.call(doc.querySelectorAll('#refunds-tbody tr'))
                .filter(function (r) { return !r.querySelector('td[colspan]'); })
                .map(function (r) { return [1, 3].map(function (n) { var c = r.children[n - 1]; return c ? c.textContent.toLowerCase() : ''; }).join(' '); });
            count();
        }).catch(function () { archiveRows = []; });
    }

    // Как в системе с 10.11: одно поле ищет по номеру, клиенту, теме и артикулу во вкладке,
    // а под таблицей видно, сколько совпадений в других статусах и в возвратах.
    function filterRequests() {
        var ex = $('[name="executor_id"]');
        filterRows('#requests-tbody', [
            { cols: [1, 2, 3], value: value('q').replace(/^#/, '') },
            { col: 4, value: ex && ex.value ? ex.options[ex.selectedIndex].text.toLowerCase() : '' }]);
        requestMatches();
    }
    var otherRows = null;
    function rowsOf(page, tbody, cols) {
        return fetch(page).then(function (r) { return r.text(); }).then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            return Array.prototype.slice.call(doc.querySelectorAll(tbody + ' tr')).filter(function (r) { return !r.querySelector('td[colspan]'); })
                .map(function (r) { return cols.map(function (n) { var c = r.children[n - 1]; return c ? c.textContent.toLowerCase() : ''; }).join(' '); });
        }).catch(function () { return []; });
    }
    function requestMatches() {
        var q = value('q').replace(/^#/, ''), box = $('#maket-request-matches');
        // Поле поиска при уходе фокуса шлёт ещё одно «change»: ту же подсказку не пересобираем, иначе клик по ссылке в ней теряется.
        var key = q + '|' + value('executor_id');
        if (box && box.dataset.key === key) return;
        if (box) box.remove();
        if (!q) return;
        var load = otherRows ? Promise.resolve(otherRows) : Promise.all([
            rowsOf('requests-status-all.html', '#requests-tbody', [1, 2, 3]),
            rowsOf('refunds.html', '#refunds-tbody', [1, 3]), rowsOf('refunds-archive.html', '#refunds-tbody', [1, 3])
        ]).then(function (r) { otherRows = { requests: r[0], refunds: r[1].concat(r[2]) }; return otherRows; });
        load.then(function (rows) {
            if (value('q').replace(/^#/, '') !== q || $('#maket-request-matches')) return;
            var here = $$('#requests-tbody tr').filter(function (r) { return !r.classList.contains('hidden') && !r.querySelector('td[colspan]'); }).length;
            var hit = function (t) { return t.indexOf(q) !== -1; };
            var other = PAGE === 'requests-status-all.html' ? 0 : Math.max(0, rows.requests.filter(hit).length - here);
            var refunds = rows.refunds.filter(hit).length;
            if (!other && !refunds) return;
            var link = encodeURIComponent($('input[name="q"]').value.trim());
            var bar = el('<div id="maket-request-matches" class="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-800"></div>');
            bar.dataset.key = key;
            if (other) bar.appendChild(el('<a href="requests-status-all.html?q=' + link + '" class="inline-flex items-center gap-1 hover:text-gray-900">В других статусах ещё <span class="font-semibold tabular-nums">' + other + '</span><span class="font-semibold text-gray-900">· Показать все</span></a>'));
            if (refunds) bar.appendChild(el('<a href="refunds.html?q=' + link + '" class="inline-flex items-center gap-1 hover:text-gray-900">В возвратах <span class="font-semibold tabular-nums">' + refunds + '</span><span class="font-semibold text-gray-900">· Открыть</span></a>'));
            var table = $('#requests-results table');
            table.parentNode.insertBefore(bar, table.nextSibling);
        });
    }
    function filterSuppliers() {
        var q = $('#supplier-search').value.trim().toLowerCase(), shown = 0;
        $$('.supplier-row').forEach(function (r) {
            var on = !q || r.dataset.search.indexOf(q) !== -1;
            r.classList.toggle('hidden', !on);
            if (on) shown++;
        });
        show($('#supplier-no-results'), !shown && $$('.supplier-row').length > 0);
    }
    // ---------- окна «Изменить» и «Новый»: сборка кладёт их в страницу шаблонами ----------
    function formModal() { return $('#supplier-modal') || $('#user-modal'); }
    function openForm(key) {
        var tpl = document.getElementById('maket-form-' + key), modal = formModal();
        var box = $('#modal-content') || $('#user-modal-content');
        if (!tpl || !modal || !box) return toast('Это макет: окно редактирования в макете не открывается');
        box.innerHTML = '';
        box.appendChild(tpl.content.cloneNode(true));
        modal.classList.remove('hidden'); modal.classList.add('flex');
    }
    function closeForm() { var modal = formModal(); if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }
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
        if (t.id === 'supplier-modal' || t.id === 'user-modal') return closeForm();
        var note = t.closest('[data-maket]');
        if (note) { e.preventDefault(); toast(note.getAttribute('data-maket')); return; }
        var row = t.closest('tr[data-href]');
        if (row && !t.closest('a,button')) { location.href = row.getAttribute('data-href'); return; }

        var undoBtn = t.closest('#status-undo');
        if (undoBtn) {
            clearInterval(undoTimer);
            setStatus($('#status-section'), undoBtn.dataset.previous, true);
            undoBtn.remove();
            return toast('Смена статуса отменена, письмо клиенту не ушло');
        }
        var statusBtn = t.closest('#status-section button');
        if (statusBtn) {
            var section = $('#status-section'), badge = $('.relative > span', section);
            var previous = badge ? badge.textContent.trim() : '';
            setStatus(section, statusBtn.dataset.status, !!badge);
            if (badge) offerUndo(section, previous);
            return;
        }

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
            if (act.indexOf('form:') === 0) return openForm(arg);
            switch (act) {
                case 'details-toggle':
                    var dform = $('#details-form'), dopen = dform.classList.contains('hidden');
                    show(dform, dopen);
                    $('#details-edit-btn').textContent = dopen ? 'Отмена' : 'Изменить';
                    if (dopen) $('#details-article-input').focus();
                    return;
                case 'executor-take':
                    var sel = $('#executor-select');
                    $$('option', sel).forEach(function (o) { if (o.textContent.trim() === ME) sel.value = o.value; });
                    show($('#take-self-btn'), false);
                    flash('executor-status', 'Сохранено');
                    return toast('Вы исполнитель запроса');
                case 'preview-remove': actEl.closest('.relative').remove(); return;
                case 'reason-toggle':
                    var form = $('#reason-edit-form'), open = form.classList.contains('hidden');
                    show(form, open); show($('#reason-display'), !open);
                    $('#reason-edit-btn').textContent = open ? 'Отмена' : 'Изменить';
                    return;
                case 'reason-save':
                    var txt = $('#reason-textarea').value.trim();
                    $('#reason-display').innerHTML = txt ? '<p class="text-sm text-gray-900 whitespace-pre-line">' + esc(txt) + '</p>' : '<p class="text-xs text-gray-500">Не указана</p>';
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
                        ? '<button data-act="client-release" class="px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors text-red-700 bg-red-50 hover:bg-red-100">Открепить</button>'
                        : '<button data-act="client-take" class="px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors text-blue-800 bg-blue-100 hover:bg-blue-200">Взять себе</button>';
                    return toast(take ? 'Клиент закреплён за вами' : 'Клиент откреплён');
                case 'file-delete':
                    if (confirm('Удалить файл?')) { actEl.closest('.attachment-row').remove(); toast('Файл удалён'); }
                    return;
                case 'notes-save': flash('notes-status'); return toast('Заметка сохранена');
                case 'upd-save': flash('upd-status'); return toast('УПД сохранён');
                case 'close-form': return closeForm();
                case 'executor-save': flash('executor-status'); return toast('Исполнитель назначен');
                case 'subject-save': flash('subject-text-status'); return toast('Тема сохранена');
                case 'supplier-save': return toast('Поставщик сохранён');
                case 'clear-filters':
                    $('#search-input').value = ''; $('#role-filter').value = ''; return filterPeople();
                case 'saved': return toast('Сохранено');
            }
            return toast(SAVE_NOTE);
        }
        var pick = t.closest('[data-pick-view]');
        if (pick) { location.href = 'requests-status-' + pick.getAttribute('data-pick-view') + '.html?q=' + encodeURIComponent(value('q')); return; }
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
        if (form.id === 'details-form') {
            var art = $('#details-article-input').value.trim(), brand = $('#details-brand-input').value.trim(), why = $('#details-reason-input').value.trim();
            $('#details-article').textContent = art || '–';
            $('#details-brand').textContent = brand || '–';
            $('#details-reason').innerHTML = why ? esc(why) : '<span class="text-xs text-gray-500">Не указано</span>';
            show(form, false);
            $('#details-edit-btn').textContent = 'Изменить';
            return toast('Артикул, марка и описание сохранены');
        }
        if (form.closest('#supplier-modal, #user-modal') && form.querySelector('[name="email"]')) {
            closeForm();
            return toast('Сохранено. В макете изменения не запоминаются');
        }
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
            var keep = value('q') ? '?q=' + encodeURIComponent($('input[name="q"]').value.trim()) : '';
            location.href = (t.value ? section + '-status-' + t.value + '.html' : section + '.html') + keep;
            return;
        }
        if (t.id === 'executor-select') {
            show($('#take-self-btn'), t.options[t.selectedIndex].textContent.trim() !== ME);
            flash('executor-status', 'Сохранено');
            return toast(t.value ? 'Исполнитель: ' + t.options[t.selectedIndex].textContent.trim() : 'Исполнитель снят');
        }
        // Клиент и сотрудник-заявитель взаимоисключающие, как в системе.
        var pair = { 'client-select': 'staff-select', 'staff-select': 'client-select', 'client-user-select': 'staff-user-select', 'staff-user-select': 'client-user-select' }[t.id];
        if (pair) {
            if (t.value && document.getElementById(pair)) document.getElementById(pair).value = '';
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
        if (t.id === 'assign-supplier-select') return toast(t.value ? 'Поставщик сохранён: ' + t.options[t.selectedIndex].text.trim() : 'Поставщик снят');
        if (t.id === 'assign-client-select' || t.id === 'executor-select') return;
    });
    var noteTimer;
    document.addEventListener('input', function (e) {
        var t = e.target;
        if (t.id === 'chat-search') return searchIn('#chat-messages', '.chat-item', t.value, 'chat-no-results');
        if (t.id === 'comments-search') return searchIn('#comments-list', '.comment-item', t.value, 'comments-no-results');
        if (t.id === 'search-input') return filterPeople();
        if (t.id === 'supplier-search') return filterSuppliers();
        if (t.id === 'notes-input') { flash('notes-status', 'Сохраняю...'); clearTimeout(noteTimer); noteTimer = setTimeout(function () { flash('notes-status'); }, 700); return; }
        if (t.name === 'order_id' && ($('#refunds-tbody') || $('#requests-tbody'))) {
            if (t.value.length === 1) toast('ID заказа в списке не показан, поиск по нему работает только в системе');
            return;
        }
        if ($('#refunds-tbody') && t.name) { filterRefunds(); return archiveMatches(); }
        if ($('#requests-tbody') && t.name === 'q') return filterRequests();
    });
    // Ссылка «Открыть архив» приносит поиск с собой.
    var startQ = new URLSearchParams(location.search).get('q');
    if (startQ && $('input[name="q"]') && $('#refunds-tbody')) { $('input[name="q"]').value = startQ; filterRefunds(); archiveMatches(); }
    if (startQ && $('input[name="q"]') && $('#requests-tbody')) { $('input[name="q"]').value = startQ; filterRequests(); }

    // ---------- плашка макета и вход ----------
    var ON = 'background:#F6993F;color:#2F2E2D', OFF = 'background:rgba(255,255,255,.1);color:#E6E2DD';
    var bar = el('<div id="maket-bar"><span style="padding:6px 8px">Макет, данные выдуманные</span>' +
        '<a href="statistics.html" style="padding:6px 10px;border-radius:8px;text-decoration:none;' + (IS_CLIENT ? OFF : ON) + '">Сотрудник</a>' +
        '<a href="client-refunds.html" style="padding:6px 10px;border-radius:8px;text-decoration:none;' + (IS_CLIENT ? ON : OFF) + '">Клиент</a></div>');
    var BAR_LOOK = 'display:flex;gap:4px;align-items:center;padding:4px;border-radius:12px;font:600 12px Inter,sans-serif;color:#E6E2DD;';
    var sidebar = $('#main-sidebar');
    var wide = window.matchMedia('(min-width: 768px)');
    // На компьютере плашка стоит в меню над блоком пользователя и ничего не закрывает, на телефоне висит внизу экрана.
    function placeBar() {
        var userBlock = sidebar && sidebar.lastElementChild;
        if (wide.matches && userBlock) {
            bar.style.cssText = BAR_LOOK + 'flex-wrap:wrap;margin:0 16px 12px;background:rgba(255,255,255,.06)';
            sidebar.insertBefore(bar, userBlock);
        } else {
            bar.style.cssText = BAR_LOOK + 'position:fixed;left:12px;bottom:12px;z-index:80;background:#2F2E2D;box-shadow:0 4px 16px rgba(0,0,0,.25)';
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
