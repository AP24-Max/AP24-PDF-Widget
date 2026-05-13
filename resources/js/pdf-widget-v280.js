(function () {
    "use strict";

    var SCRIPT_FLAG = "__AGRAR_PROFI_PDF_WIDGET_V280__";
    var CACHE_BY_URL = {};
    var PENDING_CALLBACKS_BY_URL = {};

    if (window[SCRIPT_FLAG]) {
        window[SCRIPT_FLAG].init();
        return;
    }

    function toStringValue(value) {
        return value === null || value === undefined ? "" : String(value);
    }

    function lower(value) {
        return toStringValue(value).toLowerCase();
    }

    function isTrue(value) {
        value = lower(value).trim();
        return value === "1" || value === "true" || value === "yes" || value === "ja" || value === "on";
    }

    function decodeHtml(value) {
        value = toStringValue(value);
        if (value.indexOf("&") === -1) {
            return value;
        }
        var textarea = document.createElement("textarea");
        textarea.innerHTML = value;
        return textarea.value;
    }

    function decodeUrl(value) {
        value = decodeHtml(toStringValue(value).trim());
        try {
            return decodeURIComponent(value);
        } catch (ignore) {
            return value;
        }
    }

    function safeJsonParse(value, fallback) {
        value = decodeHtml(toStringValue(value)).trim();
        if (!value || value === "undefined" || value === "null") {
            return fallback;
        }
        try {
            return JSON.parse(value);
        } catch (ignore) {
            return fallback;
        }
    }

    function safeStringify(value) {
        try {
            return JSON.stringify(value);
        } catch (ignore) {
            return "";
        }
    }

    function isPdfUrl(value) {
        return typeof value === "string" && /\.pdf(?:[?#].*)?$/i.test(value.trim());
    }

    function cleanBaseUrl(value) {
        return toStringValue(value).trim().replace(/\/+$/, "").replace(/\/propertyItems$/i, "");
    }

    function extractPublicBaseFromUrl(url) {
        url = toStringValue(url);
        var idx = url.indexOf("/propertyItems/");
        if (idx > -1) {
            return cleanBaseUrl(url.substring(0, idx));
        }
        idx = url.indexOf("/plugin/");
        if (idx > -1) {
            return cleanBaseUrl(url.substring(0, idx));
        }
        return "";
    }

    var cachedBase = null;
    function getPublicStorageBase(configuredBase, rawUrl) {
        var configured = cleanBaseUrl(configuredBase || "");
        if (configured) {
            return configured;
        }
        if (rawUrl) {
            var fromRaw = extractPublicBaseFromUrl(rawUrl);
            if (fromRaw) {
                return fromRaw;
            }
        }
        if (cachedBase !== null) {
            return cachedBase;
        }

        var urls = [];
        var nodes = document.querySelectorAll("link[href], script[src]");
        for (var i = 0; i < nodes.length; i++) {
            urls.push(nodes[i].href || nodes[i].src || "");
        }

        var preferred = "";
        var fallback = "";
        for (var u = 0; u < urls.length; u++) {
            var base = extractPublicBaseFromUrl(urls[u]);
            if (!base) {
                continue;
            }
            if (urls[u].indexOf("plentymarkets-public") !== -1 || urls[u].indexOf("s3-eu-west-1.amazonaws.com") !== -1) {
                preferred = base;
                break;
            }
            if (!fallback) {
                fallback = base;
            }
        }
        cachedBase = preferred || fallback || "";
        return cachedBase;
    }

    function normalizeUrl(rawUrl, configuredBase) {
        var raw = decodeUrl(rawUrl).replace(/\\\//g, "/").trim();
        if (!raw) {
            return "";
        }

        var base = getPublicStorageBase(configuredBase, raw);

        if (/^https?:\/\//i.test(raw)) {
            if (raw.indexOf("/propertyItems/") > -1) {
                return raw;
            }
            var absoluteMatch = raw.match(/^https?:\/\/[^/]+\/(\d+\/[^?#"'<>]+\.pdf(?:[?#][^"'<>]*)?)$/i);
            if (absoluteMatch && base) {
                return base + "/propertyItems/" + absoluteMatch[1].replace(/^\/+/, "");
            }
            return raw;
        }

        if (/^\/\//.test(raw)) {
            return window.location.protocol + raw;
        }

        var clean = raw.replace(/^\/+/, "");
        var propertyMatch = clean.match(/(?:^|.*\/)(propertyItems\/\d+\/[^?#"'<>]+\.pdf(?:[?#][^"'<>]*)?)$/i);
        if (propertyMatch && base) {
            return base + "/" + propertyMatch[1];
        }

        if (/^\d+\/[^?#"'<>]+\.pdf(?:[?#][^"'<>]*)?$/i.test(clean)) {
            return base ? base + "/propertyItems/" + clean : "/propertyItems/" + clean;
        }

        return raw.charAt(0) === "/" ? raw : "/" + clean;
    }

    function contains(haystack, needle) {
        needle = lower(decodeHtml(needle)).trim();
        return !!needle && lower(decodeHtml(haystack)).indexOf(needle) !== -1;
    }

    function splitConfigLine(line) {
        return line.indexOf("|") > -1 ? line.split("|") : line.split(";");
    }

    function parseDocumentConfig(rawConfig) {
        rawConfig = decodeHtml(rawConfig || "").trim();
        var docs = [];
        if (!rawConfig) {
            return docs;
        }

        if (rawConfig.charAt(0) === "[") {
            var jsonDocs = safeJsonParse(rawConfig, []);
            if (Array.isArray(jsonDocs)) {
                for (var j = 0; j < jsonDocs.length; j++) {
                    var row = jsonDocs[j] || {};
                    var id = toStringValue(row.id || row.propertyId || row.property_id || "").trim();
                    if (!id) {
                        continue;
                    }
                    docs.push({
                        id: id,
                        title: toStringValue(row.title || row.label || "PDF").trim() || "PDF",
                        linkLabel: toStringValue(row.linkText || row.link_label || row.linkLabel || "PDF öffnen").trim() || "PDF öffnen",
                        propertyName: toStringValue(row.propertyName || row.property_name || row.name || "").trim()
                    });
                }
                return docs;
            }
        }

        var lines = rawConfig.split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line.charAt(0) === "#") {
                continue;
            }
            var parts = splitConfigLine(line);
            var propertyId = toStringValue(parts[0] || "").trim();
            var title = toStringValue(parts[1] || "").trim();
            var linkLabel = toStringValue(parts[2] || "").trim();
            var propertyName = toStringValue(parts[3] || "").trim();
            if (!propertyId) {
                continue;
            }
            docs.push({
                id: propertyId,
                title: title || "PDF",
                linkLabel: linkLabel || ((title || "PDF") + " öffnen"),
                propertyName: propertyName
            });
        }
        return docs;
    }

    function readConfig(widget) {
        return {
            documents: parseDocumentConfig(widget.getAttribute("data-documents-config") || ""),
            publicStorageBase: widget.getAttribute("data-public-storage-base") || "",
            hideWhenEmpty: isTrue(widget.getAttribute("data-hide-when-empty")),
            debugMode: isTrue(widget.getAttribute("data-debug-mode"))
        };
    }

    function contextMatchesDocument(context, docConfig) {
        context = decodeHtml(toStringValue(context));
        if (contains(context, docConfig.id)) {
            return true;
        }
        if (docConfig.propertyName && contains(context, docConfig.propertyName)) {
            return true;
        }
        return false;
    }

    function addCandidate(out, rawUrl, context, docConfig, configuredBase) {
        rawUrl = toStringValue(rawUrl).replace(/\\\//g, "/");
        if (!isPdfUrl(rawUrl) || !contextMatchesDocument(context, docConfig)) {
            return;
        }
        var url = normalizeUrl(rawUrl, configuredBase);
        if (!isPdfUrl(url)) {
            return;
        }
        out.push({
            propertyId: docConfig.id,
            title: docConfig.title,
            linkLabel: docConfig.linkLabel,
            url: url,
            rawUrl: rawUrl,
            context: toStringValue(context).slice(0, 500)
        });
    }

    function extractPdfCandidatesFromText(text, out, cfg) {
        text = decodeHtml(toStringValue(text));
        if (text.indexOf(".pdf") === -1 || !cfg.documents.length) {
            return;
        }
        text = text.replace(/\\\//g, "/");
        var patterns = [
            /https?:\/\/[^\s"'<>\\]+\.pdf(?:[?#][^\s"'<>\\]*)?/ig,
            /propertyItems\/\d+\/[^\s"'<>\\]+\.pdf(?:[?#][^\s"'<>\\]*)?/ig,
            /(?:^|[\s"'=:(,])\d+\/[^\s"'<>\\]+\.pdf(?:[?#][^\s"'<>\\]*)?/ig
        ];

        for (var p = 0; p < patterns.length; p++) {
            var re = patterns[p];
            var match;
            while ((match = re.exec(text)) !== null) {
                var raw = toStringValue(match[0]).replace(/^[\s"'=:(,]+/, "");
                var start = Math.max(0, match.index - 900);
                var end = Math.min(text.length, match.index + raw.length + 900);
                var context = text.substring(start, end);
                for (var d = 0; d < cfg.documents.length; d++) {
                    addCandidate(out, raw, context, cfg.documents[d], cfg.publicStorageBase);
                }
            }
        }
    }

    function getWidgetJsonAttribute(widget, attributeName) {
        var value = safeJsonParse(widget.getAttribute(attributeName), []);
        if (value && !Array.isArray(value) && typeof value === "object") {
            value = [value];
        }
        return Array.isArray(value) ? value : [];
    }

    function collectWidgetSourceTexts(widget) {
        var sources = [];
        var properties = getWidgetJsonAttribute(widget, "data-ap-pdf-properties");
        var variationProperties = getWidgetJsonAttribute(widget, "data-ap-pdf-variation-properties");
        var i;
        for (i = 0; i < properties.length; i++) {
            var text = safeStringify(properties[i]);
            if (text && text.indexOf(".pdf") !== -1) {
                sources.push(text);
            }
        }
        for (i = 0; i < variationProperties.length; i++) {
            var vText = safeStringify(variationProperties[i]);
            if (vText && vText.indexOf(".pdf") !== -1) {
                sources.push(vText);
            }
        }
        return sources;
    }

    function shouldSkipObject(value) {
        if (!value || typeof value !== "object") {
            return true;
        }
        if (value === window || value === document || value === document.documentElement || value === document.body) {
            return true;
        }
        if (typeof Node !== "undefined" && value instanceof Node) {
            return true;
        }
        return false;
    }

    function findGlobalSourcesAsync(cfg, done) {
        var cacheKey = window.location.href;
        if (CACHE_BY_URL[cacheKey]) {
            done(CACHE_BY_URL[cacheKey]);
            return;
        }
        if (PENDING_CALLBACKS_BY_URL[cacheKey]) {
            PENDING_CALLBACKS_BY_URL[cacheKey].push(done);
            return;
        }
        PENDING_CALLBACKS_BY_URL[cacheKey] = [done];

        var roots = [];
        if (window.ceresStore) {
            roots.push({ label: "window.ceresStore", value: window.ceresStore });
        }
        if (window.App) {
            roots.push({ label: "window.App", value: window.App });
        }

        var queue = roots;
        var seen = typeof WeakSet !== "undefined" ? new WeakSet() : null;
        var sources = [];
        var visited = 0;
        var maxVisited = 12000;
        var maxSources = 40;
        var chunkSize = 300;

        function finish() {
            var result = { sources: sources, visited: visited };
            CACHE_BY_URL[cacheKey] = result;
            var callbacks = PENDING_CALLBACKS_BY_URL[cacheKey] || [];
            delete PENDING_CALLBACKS_BY_URL[cacheKey];
            for (var cb = 0; cb < callbacks.length; cb++) {
                callbacks[cb](result);
            }
        }

        function processChunk() {
            var count = 0;
            while (queue.length && count < chunkSize && visited < maxVisited && sources.length < maxSources) {
                var item = queue.shift();
                var value = item.value;
                count++;
                visited++;

                if (value === null || value === undefined) {
                    continue;
                }

                if (typeof value === "string") {
                    if (value.indexOf(".pdf") !== -1) {
                        sources.push(item.label + ":" + value);
                    }
                    continue;
                }

                if (typeof value !== "object" || shouldSkipObject(value)) {
                    continue;
                }

                if (seen) {
                    if (seen.has(value)) {
                        continue;
                    }
                    seen.add(value);
                }

                var keys;
                try {
                    keys = Object.keys(value);
                } catch (ignore) {
                    continue;
                }

                var hasPdfPrimitive = false;
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    var child;
                    try {
                        child = value[k];
                    } catch (ignore2) {
                        continue;
                    }
                    if (typeof child === "string" && child.indexOf(".pdf") !== -1) {
                        hasPdfPrimitive = true;
                    }
                    if (child && typeof child === "object" && !shouldSkipObject(child)) {
                        queue.push({ label: item.label + "." + k, value: child });
                    } else if (typeof child === "string" && child.length < 2000) {
                        // Primitive strings are kept with their local path for context.
                        if (child.indexOf(".pdf") !== -1) {
                            queue.push({ label: item.label + "." + k, value: child });
                        }
                    }
                }

                if (hasPdfPrimitive) {
                    var context = safeStringify(value);
                    if (context && context.indexOf(".pdf") !== -1) {
                        // Only keep JSON snippets that can plausibly match one configured document.
                        for (var d = 0; d < cfg.documents.length; d++) {
                            if (contextMatchesDocument(context, cfg.documents[d])) {
                                sources.push(context);
                                break;
                            }
                        }
                    }
                }
            }

            if ((queue.length && visited < maxVisited && sources.length < maxSources)) {
                window.setTimeout(processChunk, 0);
            } else {
                finish();
            }
        }

        window.setTimeout(processChunk, 0);
    }

    function canonicalKey(url) {
        url = toStringValue(url);
        var match = url.match(/(?:propertyItems\/)?(\d+\/[^?#"'<>]+\.pdf)/i);
        if (match) {
            return match[1].toLowerCase();
        }
        return url.toLowerCase();
    }

    function finalizeDocuments(raw, cfg) {
        var byProperty = {};
        var i;
        for (i = 0; i < raw.length; i++) {
            var key = raw[i].propertyId;
            if (!byProperty[key]) {
                byProperty[key] = raw[i];
            }
        }

        var ordered = [];
        for (i = 0; i < cfg.documents.length; i++) {
            var configured = cfg.documents[i];
            var doc = byProperty[configured.id];
            if (!doc) {
                continue;
            }
            doc.title = configured.title;
            doc.linkLabel = configured.linkLabel;
            var duplicate = false;
            var key2 = canonicalKey(doc.url);
            for (var x = 0; x < ordered.length; x++) {
                if (ordered[x].propertyId === doc.propertyId || canonicalKey(ordered[x].url) === key2) {
                    duplicate = true;
                    break;
                }
            }
            if (!duplicate) {
                ordered.push(doc);
            }
        }
        return ordered;
    }

    function findDocumentsFromSources(sources, cfg) {
        var candidates = [];
        for (var i = 0; i < sources.length; i++) {
            extractPdfCandidatesFromText(sources[i], candidates, cfg);
        }
        return {
            documents: finalizeDocuments(candidates, cfg),
            rawCount: candidates.length,
            sourceCount: sources.length,
            configuredCount: cfg.documents.length
        };
    }

    function makeDocumentLink(doc) {
        var a = document.createElement("a");
        a.className = "ap-pdf-document-link";
        a.href = doc.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        var icon = document.createElement("span");
        icon.className = "ap-pdf-document-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "PDF";

        var text = document.createElement("span");
        text.className = "ap-pdf-document-text";

        var title = document.createElement("span");
        title.className = "ap-pdf-document-title";
        title.textContent = doc.title;

        var subtitle = document.createElement("span");
        subtitle.className = "ap-pdf-document-subtitle";
        subtitle.textContent = doc.linkLabel;

        text.appendChild(title);
        text.appendChild(subtitle);
        a.appendChild(icon);
        a.appendChild(text);
        return a;
    }

    function renderEmpty(widget, list, cfg, result, globalInfo) {
        widget.classList.remove("ap-pdf-widget-has-documents");
        widget.classList.add("ap-pdf-widget-no-documents");
        list.innerHTML = "";

        if (cfg.debugMode) {
            var debugEmpty = document.createElement("div");
            debugEmpty.className = "ap-pdf-widget-debug";
            debugEmpty.textContent = "PDF-Widget Debug: Dokumente=0, Kandidaten=" + result.rawCount + ", Quellen=" + result.sourceCount + ", konfiguriert=" + result.configuredCount + ", GlobalVisited=" + (globalInfo ? globalInfo.visited : 0) + ", v=2.8.0";
            list.appendChild(debugEmpty);
            return;
        }

        // Important: keep a minimal real element in the ShopBuilder tab content.
        // Some tab layouts collapse or damage following rows when a tab pane becomes completely empty.
        var spacer = document.createElement("span");
        spacer.className = "ap-pdf-empty-spacer";
        spacer.setAttribute("aria-hidden", "true");
        spacer.textContent = "\u00a0";
        list.appendChild(spacer);
    }

    function renderDocuments(widget, list, cfg, result, globalInfo) {
        widget.classList.remove("ap-pdf-widget-no-documents");
        widget.classList.add("ap-pdf-widget-has-documents");
        list.innerHTML = "";
        for (var i = 0; i < result.documents.length; i++) {
            list.appendChild(makeDocumentLink(result.documents[i]));
        }
        if (cfg.debugMode) {
            var debug = document.createElement("div");
            debug.className = "ap-pdf-widget-debug";
            debug.textContent = "PDF-Widget Debug: Dokumente=" + result.documents.length + ", Kandidaten=" + result.rawCount + ", Quellen=" + result.sourceCount + ", konfiguriert=" + result.configuredCount + ", GlobalVisited=" + (globalInfo ? globalInfo.visited : 0) + ", v=2.8.0";
            list.appendChild(debug);
        }
    }

    function finishWidget(widget) {
        widget.classList.remove("ap-pdf-widget-loading");
        widget.classList.add("ap-pdf-widget-ready");
        widget.setAttribute("data-ap-pdf-rendered", "1");
        widget.hidden = false;
        widget.removeAttribute("hidden");
    }

    function renderWidget(widget, allowAsyncFallback) {
        if (!widget) {
            return;
        }

        var cfg = readConfig(widget);
        var list = widget.querySelector("[data-ap-pdf-list]");
        if (!list) {
            return;
        }

        var widgetSources = collectWidgetSourceTexts(widget);
        var result = findDocumentsFromSources(widgetSources, cfg);

        // Never hide the widget root and never manipulate tabs/rows/columns.
        widget.hidden = false;
        widget.removeAttribute("hidden");

        if (result.documents.length) {
            renderDocuments(widget, list, cfg, result, null);
            finishWidget(widget);
            return;
        }

        renderEmpty(widget, list, cfg, result, null);
        finishWidget(widget);

        if (allowAsyncFallback === false || widget.getAttribute("data-ap-pdf-global-scan") === "1") {
            return;
        }

        widget.setAttribute("data-ap-pdf-global-scan", "1");
        findGlobalSourcesAsync(cfg, function (globalInfo) {
            var currentCfg = readConfig(widget);
            var allSources = collectWidgetSourceTexts(widget).concat(globalInfo.sources || []);
            var globalResult = findDocumentsFromSources(allSources, currentCfg);
            if (globalResult.documents.length) {
                renderDocuments(widget, list, currentCfg, globalResult, globalInfo);
            } else {
                renderEmpty(widget, list, currentCfg, globalResult, globalInfo);
            }
            finishWidget(widget);
        });
    }

    function initWidget(widget) {
        if (!widget || widget.getAttribute("data-ap-pdf-observed") === "1") {
            renderWidget(widget, true);
            return;
        }

        widget.setAttribute("data-ap-pdf-observed", "1");
        renderWidget(widget, true);

        if (typeof MutationObserver !== "undefined") {
            var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    if (mutations[i].attributeName === "data-ap-pdf-properties" || mutations[i].attributeName === "data-ap-pdf-variation-properties") {
                        widget.removeAttribute("data-ap-pdf-global-scan");
                        renderWidget(widget, true);
                        break;
                    }
                }
            });
            observer.observe(widget, { attributes: true, attributeFilter: ["data-ap-pdf-properties", "data-ap-pdf-variation-properties"] });
        }

        window.setTimeout(function () { renderWidget(widget, true); }, 150);
    }

    function init() {
        var widgets = document.querySelectorAll("[data-ap-pdf-widget]");
        for (var i = 0; i < widgets.length; i++) {
            initWidget(widgets[i]);
        }
    }

    window[SCRIPT_FLAG] = { init: init };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
