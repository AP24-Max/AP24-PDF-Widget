# AgrarProfiPdfWidget 2.12.0

ShopBuilder-Widget für PDF-Dokumente aus plentyONE Varianten-Eigenschaften vom Typ `Datei`.

## Nutzung

Im ShopBuilder einen festen Tab anlegen, z. B. `Datenblätter/Anleitungen`, und dieses Widget in den Tab ziehen.

Im Plugin unter `PDF-Widget` pro Dokument eine Zeile pflegen:

```text
Eigenschaft-ID|Titel|Linktext
```

Beispiel:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen
1935|Datenblatt|Datenblatt öffnen
```

Optional kann ein Eigenschaftsname als vierter Wert angegeben werden:

```text
1934|Bedienungsanleitung|Bedienungsanleitung öffnen|PDF Anleitung
```

## Version 2.12.0

Verbesserter Parser für mehrere plenty Datei-Eigenschaften im gerenderten `variationProperties`-JSON. Er erkennt jetzt gezielt Blöcke mit `propertyId` und `values.value`, z. B.:

```json
"propertyId":1935,
"values":{"id":192670,"value":"192670/Scharmueller-(36).pdf"}
```

Daraus wird automatisch eine öffentliche `propertyItems`-URL zusammengesetzt.

## Container-Verknüpfungen

Für Styles und Script müssen diese Container gesetzt sein:

- `PDF-Widget: Styles` → `Ceres::SingleItem.Styles`
- `PDF-Widget: Script` → `Ceres::SingleItem.AfterScriptsLoaded`

Das Widget erzeugt keinen Tab und blendet keinen Tab aus.
