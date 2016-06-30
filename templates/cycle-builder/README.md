Cycle Builder
=============

The Dashboard's cycle builder supports the creation and editing of the PPG patterns control things like beam on / beam off, tape moves, triggers and data writing.

## Maintenance Requirements

### ODB Structures

The cycle builider expects the following ODB structure to exist:

```
/PPG
|_______Current (string)
|_______/Cycles
        |_________________/<cycle def 1>
                          |______________________PPGcodes  (int array)
                          |______________________durations (int array)
        |_________________/<cycle def 2>
        .
        .
        .
        |_________________/<cycle def n>
```

 - **`/PPG/Current`**: the string title of the currently active cycle; must match the name of a subdirectory of `/PPG/Cycles`.
 - **`/PPG/Cycles/<cycle def>/PPGcodes`**: array of integers containing the PPG codes (see below) for each step in order for cycle <cycle def>.
 - **`/PPG/Cycles/<cycle def>/durations`**: array of integers describing the length [us] of the cycle step found at the same array position in `PPGcodes`.

 ### PPG Codes

 The Dashboard encodes cycle steps via the following table:

 PPG Code   | Meaning
 -----------|--------
 0x00010001 | Beam On
 0xC008C008 | Move Tape
 0x00800080 | HPGe Trigger
 0x01000100 | SCEPTAR Trigger
 0x02000200 | Si(Li) Trigger
 0x04000400 | LaBr3 Trigger
 0x08000800 | DESCANT Trigger
 0xC002C002 | Collect Background
 0xC001C001 | Collect Data with Beam on
 0xC004C004 | Collect Data with Beam off
 0xC010C010 | Collect Source Data
 0x00020002 | Unassigned Output 2
 0x00040004 | Unassigned Output 3
 0x00100010 | Unassigned Output 5
 0x00200020 | Unassigned Output 6
 0x00400040 | Unassigned Output 7
