# AgrarProfiPdfWidget 2.4.0

Reines ShopBuilder-Widget für PDF-Dokumente aus Varianten-Eigenschaften vom Typ Datei.

## Wichtig

Dieses Plugin erzeugt keine Tabs automatisch und registriert keine Container-Ausgabe. Es wird erst sichtbar, wenn das Widget im ShopBuilder platziert wird.

Empfohlener Einsatz:

1. Altes Plugin `AgrarProfiPdfTabs` aus dem Plugin-Set entfernen oder vollständig deaktivieren.
2. Plugin-Set bereitstellen.
3. Dieses Plugin `AgrarProfiPdfWidget` installieren und bereitstellen.
4. Im Plugin die Eigenschafts-IDs für Anleitung und Datenblatt eintragen.
5. Im ShopBuilder im gewünschten Artikel-Tab das Widget `PDF-Dokumente aus Artikel-Eigenschaften` platzieren.

## Neu in 2.4.0

- Optionales Ausblenden des übergeordneten ShopBuilder-/Tab-Reiters, wenn keine PDFs gefunden werden.
- Neuer JS-/CSS-Dateiname zur Cache-Trennung.
- Das Widget durchsucht nur den aktuellen Ceres-Artikelzustand und keine globalen Inline-Skripte mehr. Dadurch werden keine PDF-Links von anderen Artikeln übernommen.

## Hinweise

- Das Widget sucht nur nach PDFs, die im aktuellen Frontend-Artikeldatensatz mit den konfigurierten Eigenschaften zusammenhängen.
- Wenn keine PDFs gefunden werden, blendet sich das Widget aus. Ist die Option aktiviert, wird zusätzlich der umgebende Tab-Reiter ausgeblendet.


## Version 2.4.0

- Widget zusätzlich über den aktuellen ShopBuilder `ContentWidgetRepositoryContract` registriert.
- `contentWidgets.json` bleibt als Fallback für ältere plentyShop-LTS-Systeme enthalten.
- Keine Container-Ausgabe und kein automatisches Frontend-Script außerhalb des Widgets.


## Version 2.4.0

Layout-sichere Version: Das Widget blendet bei fehlenden PDFs nur sich selbst und optional den Tab-Kopf aus. Es verändert keine ShopBuilder-Container, Tab-Panes, Rows oder Spalten mehr. Zusätzlich werden Inline-Script-Daten und gezielte Ceres-Datenquellen auf PDF-Eigenschaften geprüft.
