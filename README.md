# AgrarProfiPdfWidget 2.1.0

Reines ShopBuilder-Widget für PDF-Dokumente aus Varianten-Eigenschaften vom Typ Datei.

## Wichtig

Dieses Plugin erzeugt keine Tabs automatisch und registriert keine Container-Ausgabe. Es wird erst sichtbar, wenn das Widget im ShopBuilder platziert wird.

Empfohlener Einsatz:

1. Altes Plugin `AgrarProfiPdfTabs` aus dem Plugin-Set entfernen oder vollständig deaktivieren.
2. Plugin-Set bereitstellen.
3. Dieses Plugin `AgrarProfiPdfWidget` installieren und bereitstellen.
4. Im Plugin die Eigenschafts-IDs für Anleitung und Datenblatt eintragen.
5. Im ShopBuilder im gewünschten Artikel-Tab das Widget `PDF-Dokumente aus Artikel-Eigenschaften` platzieren.

## Hinweise

- Das Widget sucht nur nach PDFs, die im Frontend-Datensatz mit den konfigurierten Eigenschaften zusammenhängen.
- Es gibt keinen rekursiven Scan durch `window.ceresStore` mehr.
- Wenn keine PDFs gefunden werden, blendet sich das Widget aus. Der ShopBuilder-Tab selbst bleibt sichtbar, wenn er im Layout statisch angelegt wurde.
