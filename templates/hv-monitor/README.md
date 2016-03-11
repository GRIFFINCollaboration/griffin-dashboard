HV Monitor
==========

The HV Monitor provides summary and control of the experiments high voltage channels.

## Maintenance Requirements

### Frontends & ODB Structures

The HV monitor relies on the ODB structures created by the CAEN HV frontends found [here](https://github.com/GRIFFINCollaboration/MIDASfrontends), and expects the corresponding ODB Equipment subdirectories to be named `HV-0`, `HV-1`... Set the subdirectory names in `fesy2527.c` via the line

```
{"HV-0",                       /* equipment name */
```

### Developer Notes

 - The HV monitor infers what cards to draw at what positions in what crates from the `crateMap` encoding, found in the ODB at `/Equipment/HV-*/Settings/Devices/sy2527/DD/crateMap`. This encoding is unpacked by `unpackHVCrateMap(crateMap)`; that function's docstring contains the details of how to decode the crate map.