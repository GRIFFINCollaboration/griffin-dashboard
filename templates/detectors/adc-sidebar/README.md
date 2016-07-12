ADC Communication
=================

The Dashboard communicates with GRIF-16 digitizers via their API described below and through the ODB in order to report real-time trigger rates and expose ADC parameter controls.

## Maintenance Requirements

### Communication Logic

The Dashboard, ODB and electronics can read and write ADC control parameters to each other. To avoid control chaos, we nominally follow the following flow; arrow direction indicates information flowing from one place to another:

![ADC data flow](https://github.com/GRIFFINCollaboration/griffin-dashboard/blob/gh-pages/img/adc-flow.png)

Note that this means the Dashboard may pull a stale parameter from the ADC after writing a fresh one to the ODB, but before the ODB has pushed to the ADC; wait a couple seconds and the round trip should complete itself. The only exception to this is that the Dashboard will read from the ODB when reporting ADC and HV *settings*.

### ADC ODB Hierarchy

All GRIF-16s pull their parameters from the ODB, following a template and custom model. See [the DAQ docs](https://github.com/GRIFFINCollaboration/griffin-dashboard/tree/gh-pages/templates/daq-monitor) for an illustration of the relevant ODB structure, `/DAQ/params`. Under `/DAQ/params/grif16/template` are numbered subdirectories (0 through 9), corresponding to templates for the 10 different detector types supported:

Detector index | Detector Type
---------------|--------------
0 | GRIFFIN Low Gain
1 | GRIFFIN High Gain
2 | SCEPTAR
3 | LaBr3 (Energy)
4 | LaBr3 (Time)
5 | PACES
6 | DESCANT
7 | GRIFFIN Suppressors
8 | LaBr3 Suppressors
9 | ZDS

Beneath these sit key / values (see list of [ADC keys below](https://github.com/GRIFFINCollaboration/griffin-dashboard/tree/gh-pages/templates/detectors/adc-sidebar#adc-level-keys)) with the default values for each key, for the given detector type; this default will be applied to all matching ADC channels in the absence of a custom parameter.

Under `/DAQ/params/grif16/custom` sit directories with channel names matching the [standard naming convention](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature); these directories contain keys drawn from the same list as the template directories, with custom settings to be applied only to the corresponding channel.

So for example:

```
/DAQ/params/grif16
           |__________/template
                      |__________/0
                                 |____a_dcofst: 0
           |
           |__________/custom
                      |__________/GRG01BN00A
                                 |____a_dcofst: 1

```

Would set all GRIFFIN low gain detectors to have 0 DC offset, except for the blue crystal in detector 1, which would have a DC offset of 1 mV.

### ADC API

GRIF-16s provide a web-facing API from which to poll information, and expose ADC parameter control. This API consists of two parts: a high rate endpoint for frequent real-time reporting of trigger rates, and a settings endpoint for reading back settings of individual ADC channels.

In what follows, `host` refers to the digitizer host, ie `http://grifadc02.triumf.ca/`

#### High-Rate Endpoint

**Found at**: `host/report`

The `/report` endpoint provides an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) response that packs threshold, trigger request rate, and trigger accept rate information into a condensed format appropriate for large or frequent requests. For every channel at `host`, the response ArrayBuffer contains a 14-byte block of information:

 - bytes 0 through 1: MSC address of channel
 - bytes 2 through 5: trigger accepts
 - bytes 6 through 9: trigger requests
 - bytes 10 through 13: threshold

Channels are packed into the complete ArrayBuffer in no particular order.

#### Settings Endpoint

**Found at**: `host/mscb?node=n`

The `/mscb` endpoint provides a JSON response containing the current settings and status of the digitizer at `?node=1`, and settings for the nth ADC at `?node=2+n` - in other words, an ADC with MSC address `0x??00` would be reported at `?node=2`, `0x??01` at `?node=3`, etc. Below we list the keys reported by each.

##### Digitizer-level keys

Found in the response under key `vars`:

key|definition
---|----------
`serial` | Digitizer serial number
`cpu_temp`| FPGA temperature [C]
`cc_lock`| Clock cleaner locked
`cc_freq1`|
`cc_refck`|
`cc_freq0`|
`dc_freq`|
`hw_time`| Hardware timestamp
`hw_id`| Hardware ID
`sw_id`| Software ID
`hw_sw_m`| Hardware/Software match
`sw_time`| Software timestamp
`hwbuild`|
`swbuild`|
`up_time`| Uptime [s]
`dac_ch1`|
`dac_ch0`|
`ref_clk`| Reference Clock
`allowWr`|
`sp_run`|
`sp_rst`|
`sp_mod`|
`sp_invr`|
`a_cid0`|
`a_cid1`|
`a_cid3`|
`a_grad0`|
`a_cid2`|
`a_grad1`|
`a_grad2`|
`a_grad3`|
`a_locka`|
`a_align`|
`a_lkcn0`|
`a_lkcn1`|
`a_lkcn2`|
`a_lkcn3`|
`a_lock0`|
`a_lock1`|
`a_lock2`|
`a_lock3`|
`s0_lock`|
`s0_trdy`|
`s0_rrdy`|
`s0_rdata`|
`s0_crc`|
`s0_rack`|
`s0_ridle`|
`s0_lkcnt`|
`s0_rparm`|
`s0_runkn`|
`s0_rerr`|
`s0_tidle`|
`s0_tdata`|
`s0_tack`|
`s0_tparm`|
`s0_rlstl`|
`s0_rlsth`|
`sp_rncnt`|
`sp_rstat`|
`sp_estat`|
`sp_runst`|
`sp_runtm`|
`sp_evbuf`|
`cc_loss`|
`cc_clke`|
`sfp_nm`|
`sfp_pn`|
`sfp_oui`|
`sfp_sn`|
`sfp_rev`|
`sfp_conn`|
`eFmTxOK`|
`eFmRxOK`|
`eFmCkSqE`|
`eAlgnErr`|
`eOctTxOK`|
`eOctRxOK`|
`eTxPsCFm`|
`eRxPsCFm`|
`eIInErr`|
`eIOutErr`|
`eIUcPkt`|
`eIMcPkt`|
`eIBcPkt`|
`eODscrd`|
`eOUcPkt`|
`eOMcPkt`|
`eOBcPkt`|
`ethOct`|
`ethPkt`|
`eDropEv`|
`ethUsz`|
`ethOsz`|
`eth128`|
`eth256`|
`eth65`|
`eth640`|
`eth512`|
`eth1024`|
`eth1519`|
`ethJab`|
`daq_name`|
`coll_ch`|
`mstr_ch`|
`ethFrag`|
`boardId`|
`daq_ip`|
`daq_port`|
`daq_dtcr`|
`daq_tmpl`|
`daq_cstm`|

##### ADC-Level Keys

Found in the response under key `vars`:

key|definition
---|----------
`a_enable`| ADC enabled
`a_pol`| Polarity
`a_fgain`| ADC gain
`a_trim`|
`a_dcofst`| DC offset
`t_on`| Triggering enabled
`t_thres`| Trigger threshold
`t_diff`| Trigger differentiation
`t_int`| Trigger integration
`p_int`| Pulse height integration
`p_diff`| Pulse height differentiation
`p_delay`| Pulse height delay
`p_polec1`| Pulse height pole correction
`wfr_smpl`| Waveform samples
`wfr_pret`| Waveform pretrigger
`wfr_mode`| Waveform mode
`sim_ena`| Simulation enabled
`sim_enat`| Simulation trigger enabled
`sim_enar`| Simulation random enabled
`sim_pol`| Simulation polarity
`sim_rise`| Simulation rise time
`sim_amp`| Simulation amplitude
`sim_rate`| Simulation rate
`sim_cyc`| Simulation cycle waveform
`sim_dly0`| Simulation delay 0
`sim_dly1`| Simulation delay 1
`sim_dly2`| Simulation delay 2
`sim_dly3`| Simulation delay 3
`sim_amp0`| Simulation amplitude 0
`sim_amp1`| Simulation amplitude 1
`sim_amp2`| Simulation amplitude 2
`sim_amp3`| Simulation amplitude 3
`dtsclr_b`| Deadtime readout
`trsclr_b`| Trigger readout
`cfd_dly`| CFD delay
`rt_d0`|
`rt_d1`|
`rt_d10`|
`rt_d100`|
`rt_acpt`| Trigger accept rate
`rt_rqst`| Trigger request rate
`rt_dwav`| Dropped waveform
`rt_dbsy`| Dropped busy
`rt_dqt`| Dropped QT
`rt_dtrg`| Dropped trigger
`rt_dded`| Dropped deadtime
`st_trig`| Trigger count
`st_trigr`| Trigger request count
`st_btrig`| Trigger buffer fill level
`st_bwv`| Waveform buffer fill level
`st_bqt`| QT buffer fill level
`st_bevr`| Event buffer read
`st_bevw`| Event buffer write
`prg_ddtm`| Prog deadtime
`det_type`| Detector type
`syn_lvtm`| Sync livetime
`syn_ddtm`| Sync deadtime
`daq_chnm`|
`daq_wrTp`|
`daq_clrC`|