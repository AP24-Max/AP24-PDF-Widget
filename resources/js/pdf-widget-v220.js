(function () {
    "use strict";

    var SCRIPT_FLAG = "__AGRAR_PROFI_PDF_WIDGET_V220__";
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

    function isPdfUrl(value) {
        return typeof value === "string" && /\.pdf(?:[?#].*)?$/i.test(value.trim());
    }

    function decodeUrl(value) {
        value = toStringValue(value).trim();
        try {
            return decodeURIComponent(value);
        } catch (ignore) {
            return value;
        }
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
        return "";
    }

    function getPublicStorageBase(configuredBase, rawUrl) {
        var configured = cleanBaseUrl(configuredBase || "");
        if (configured) {
            return configured;
        }
        return extractPublicBaseFromUrl(rawUrl);
    }

    function normalizeUrl(rawUrl, configuredBase) {
        var raw = decodeUrl(rawUrl).replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
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
        needle = lower(needle).trim();
        return !!needle && lower(haystack).indexOf(needle) !== -1;
    }

    function readConfig(widget) {
        return {
            manualPropertyId: widget.getAttribute("data-manual-property-id") || "",
            datasheetPropertyId: widget.getAttribute("data-datasheet-property-id") || "",
            manualPropertyName: widget.getAttribute("data-manual-property-name") || "PDF Anleitung",
            datasheetPropertyName: widget.getAttribute("data-datasheet-property-name") || "PDF Datenblatt",
            manualTitle: widget.getAttribute("data-manual-title") || "Bedienungsanleitung",
            datasheetTitle: widget.getAttribute("data-datasheet-title") || "Datenblatt",
            manualLinkLabel: widget.getAttribute("data-manual-link-label") || "Bedienungsanleitung öffnen",
            datasheetLinkLabel: widget.getAttribute("data-datasheet-link-label") || "Datenblatt öffnen",
            publicStorageBase: widget.getAttribute("data-public-storage-base") || "",
            hideWhenEmpty: isTrue(widget.getAttribute("data-hide-when-empty")),
            hideTabWhenEmpty: isTrue(widget.getAttribute("data-hide-tab-when-empty")),
            debugMode: isTrue(widget.getAttribute("data-debug-mode"))
        };
    }

    function contextMatchesType(context, type, cfg) {
        context = lower(context);
        if (type === "manual") {
            return contains(context, cfg.manualPropertyId) || contains(context, cfg.manualPropertyName) ||
                context.indexOf("bedienungsanleitung") !== -1 || context.indexOf("gebrauchsanweisung") !== -1 ||
                context.indexOf("betriebsanleitung") !== -1 || context.indexOf("anleitung") !== -1;
        }
        if (type === "datasheet") {
            return contains(context, cfg.datasheetPropertyId) || contains(context, cfg.datasheetPropertyName) ||
                context.indexOf("datenblatt") !== -1 || context.indexOf("datasheet") !== -1;
        }
        return false;
    }

    function addCandidate(out, rawUrl, context, type, cfg) {
        rawUrl = toStringValue(rawUrl).replace(/\\\//g, "/");
        if (!isPdfUrl(rawUrl) || !contextMatchesType(context, type, cfg)) {
            return;
        }
        var url = normalizeUrl(rawUrl, cfg.publicStorageBase);
        if (!isPdfUrl(url)) {
            return;
        }
        out.push({
            type: type,
            url: url,
            rawUrl: rawUrl,
            context: toStringValue(context).slice(0, 500)
        });
    }

    function extractPdfCandidatesFromText(text, out, cfg) {
        text = toStringValue(text);
        if (text.indexOf(".pdf") === -1) {
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
                var start = Math.max(0, match.index - 600);
                var end = Math.min(text.length, match.index + raw.length + 600);
                var context = text.substring(start, end);
                addCandidate(out, raw, context, "manual", cfg);
                addCandidate(out, raw, context, "datasheet", cfg);
            }
        }
    }

    function collectSourceTexts() {
        var sources = [];
        try {
            if (window.ceresStore && window.ceresStore.state && window.ceresStore.state.item) {
                sources.push(JSON.stringify(window.ceresStore.state.item));
            }
        } catch (ignoreItem) {}

        return sources;
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
        var usedByType = {};
        var result = [];
        for (var i = 0; i < raw.length; i++) {
            var doc = raw[i];
            var key = doc.type + "|" + canonicalKey(doc.url);
            if (usedByType[key]) {
                continue;
            }
            usedByType[key] = true;
            if (doc.type === "manual") {
                doc.title = cfg.manualTitle || "Bedienungsanleitung";
                doc.linkLabel = cfg.manualLinkLabel || "Bedienungsanleitung öffnen";
            } else if (doc.type === "datasheet") {
                doc.title = cfg.datasheetTitle || "Datenblatt";
                doc.linkLabel = cfg.datasheetLinkLabel || "Datenblatt öffnen";
            } else {
                continue;
            }
            result.push(doc);
        }

        var manual = null;
        var datasheet = null;
        for (i = 0; i < result.length; i++) {
            if (result[i].type === "manual" && !manual) {
                manual = result[i];
            }
            if (result[i].type === "datasheet" && !datasheet) {
                datasheet = result[i];
            }
        }

        var ordered = [];
        if (manual) {
            ordered.push(manual);
        }
        if (datasheet) {
            ordered.push(datasheet);
        }
        return ordered;
    }

    function findDocuments(cfg) {
        var candidates = [];
        var sources = collectSourceTexts();
        for (var i = 0; i < sources.length; i++) {
            extractPdfCandidatesFromText(sources[i], candidates, cfg);
        }
        return {
            documents: finalizeDocuments(candidates, cfg),
            rawCount: candidates.length,
            sourceCount: sources.length
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

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(value);
        }
        return toStringValue(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    }

    function findTabPane(widget) {
        var el = widget.parentElement;
        while (el && el !== document.body) {
            if (el.getAttribute("role") === "tabpanel" || (el.classList && el.classList.contains("tab-pane"))) {
                return el;
            }
            if (el.id) {
                var selector = '[href="#' + cssEscape(el.id) + '"], [data-target="#' + cssEscape(el.id) + '"], [aria-controls="' + cssEscape(el.id) + '"]';
                if (document.querySelector(selector)) {
                    return el;
                }
            }
            el = el.parentElement;
        }
        return null;
    }

    function findTabToggleForPane(pane) {
        if (!pane || !pane.id) {
            return null;
        }
        var id = cssEscape(pane.id);
        return document.querySelector('[href="#' + id + '"], [data-target="#' + id + '"], [aria-controls="' + id + '"]');
    }

    function isElementVisible(el) {
        return !!(el && el.offsetParent !== null && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden");
    }

    function activateFirstVisibleSiblingTab(hiddenToggle) {
        if (!hiddenToggle) {
            return;
        }
        var navItem = hiddenToggle.closest ? hiddenToggle.closest("li, .nav-item, [role='presentation']") : null;
        var nav = navItem && navItem.parentElement ? navItem.parentElement : hiddenToggle.parentElement;
        if (!nav) {
            return;
        }
        var toggles = nav.querySelectorAll('[href^="#"], [data-target^="#"], [aria-controls]');
        for (var i = 0; i < toggles.length; i++) {
            if (toggles[i] !== hiddenToggle && isElementVisible(toggles[i])) {
                try {
                    toggles[i].click();
                } catch (ignoreClick) {}
                return;
            }
        }
    }

    function hideParentTab(widget) {
        var pane = findTabPane(widget);
        var toggle = findTabToggleForPane(pane);

        if (pane) {
            pane.hidden = true;
            pane.style.display = "none";
            pane.setAttribute("data-ap-pdf-tab-hidden", "1");
        }

        if (toggle) {
            var wasActive = toggle.classList && toggle.classList.contains("active");
            var navItem = toggle.closest ? toggle.closest("li, .nav-item, [role='presentation']") : null;
            var target = navItem || toggle;
            target.hidden = true;
            target.style.display = "none";
            target.setAttribute("data-ap-pdf-tab-hidden", "1");
            toggle.setAttribute("aria-hidden", "true");
            toggle.setAttribute("tabindex", "-1");
            if (wasActive) {
                activateFirstVisibleSiblingTab(toggle);
            }
        }
    }

    function renderWidget(widget) {
        if (!widget || widget.getAttribute("data-ap-pdf-initialized") === "1") {
            return;
        }
        widget.setAttribute("data-ap-pdf-initialized", "1");
        var cfg = readConfig(widget);
        var list = widget.querySelector("[data-ap-pdf-list]");
        if (!list) {
            return;
        }

        var result = findDocuments(cfg);
        list.innerHTML = "";

        if (!result.documents.length) {
            widget.classList.add("ap-pdf-widget-empty");
            if (cfg.hideWhenEmpty) {
                widget.hidden = true;
            } else {
                var empty = document.createElement("div");
                empty.className = "ap-pdf-widget-placeholder";
                empty.textContent = "Keine PDF-Dokumente gefunden.";
                list.appendChild(empty);
            }
            if (cfg.hideTabWhenEmpty) {
                hideParentTab(widget);
            }
        } else {
            widget.hidden = false;
            widget.classList.remove("ap-pdf-widget-empty");
            for (var i = 0; i < result.documents.length; i++) {
                list.appendChild(makeDocumentLink(result.documents[i]));
            }
        }

        if (cfg.debugMode) {
            var debug = document.createElement("div");
            debug.className = "ap-pdf-widget-debug";
            debug.textContent = "PDF-Widget Debug: Dokumente=" + result.documents.length + ", Kandidaten=" + result.rawCount + ", Quellen=" + result.sourceCount;
            list.appendChild(debug);
        }

        widget.classList.remove("ap-pdf-widget-loading");
        widget.classList.add("ap-pdf-widget-ready");
    }

    function init() {
        var widgets = document.querySelectorAll("[data-ap-pdf-widget]");
        for (var i = 0; i < widgets.length; i++) {
            renderWidget(widgets[i]);
        }
    }

    window[SCRIPT_FLAG] = { init: init };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
