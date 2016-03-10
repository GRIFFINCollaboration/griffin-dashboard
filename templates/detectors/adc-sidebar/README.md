ADC Communication
=================

The Dashboard communicates with GRIF-16 digitizers via their API described below and through the ODB in order to report real-time trigger rates and expose ADC parameter controls.

## Maintenance Requirements

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

- `serial`
- `cpu_temp`
- `cc_lock`
- `cc_freq1`
- `cc_refck`
- `cc_freq0`
- `dc_freq`
- `hw_time`
- `hw_id`
- `sw_id`
- `hw_sw_m`
- `sw_time`
- `hwbuild`
- `swbuild`
- `up_time`
- `dac_ch1`
- `dac_ch0`
- `ref_clk`
- `allowWr`
- `sp_run`
- `sp_rst`
- `sp_mod`
- `sp_invr`
- `a_cid0`
- `a_cid1`
- `a_cid3`
- `a_grad0`
- `a_cid2`
- `a_grad1`
- `a_grad2`
- `a_grad3`
- `a_locka`
- `a_align`
- `a_lkcn0`
- `a_lkcn1`
- `a_lkcn2`
- `a_lkcn3`
- `a_lock0`
- `a_lock1`
- `a_lock2`
- `a_lock3`
- `s0_lock`
- `s0_trdy`
- `s0_rrdy`
- `s0_rdata`
- `s0_crc`
- `s0_rack`
- `s0_ridle`
- `s0_lkcnt`
- `s0_rparm`
- `s0_runkn`
- `s0_rerr`
- `s0_tidle`
- `s0_tdata`
- `s0_tack`
- `s0_tparm`
- `s0_rlstl`
- `s0_rlsth`
- `sp_rncnt`
- `sp_rstat`
- `sp_estat`
- `sp_runst`
- `sp_runtm`
- `sp_evbuf`
- `cc_loss`
- `cc_clke`
- `sfp_nm`
- `sfp_pn`
- `sfp_oui`
- `sfp_sn`
- `sfp_rev`
- `sfp_conn`
- `eFmTxOK`
- `eFmRxOK`
- `eFmCkSqE`
- `eAlgnErr`
- `eOctTxOK`
- `eOctRxOK`
- `eTxPsCFm`
- `eRxPsCFm`
- `eIInErr`
- `eIOutErr`
- `eIUcPkt`
- `eIMcPkt`
- `eIBcPkt`
- `eODscrd`
- `eOUcPkt`
- `eOMcPkt`
- `eOBcPkt`
- `ethOct`
- `ethPkt`
- `eDropEv`
- `ethUsz`
- `ethOsz`
- `eth128`
- `eth256`
- `eth65`
- `eth640`
- `eth512`
- `eth1024`
- `eth1519`
- `ethJab`
- `daq_name`
- `coll_ch`
- `mstr_ch`
- `ethFrag`
- `boardId`
- `daq_ip`
- `daq_port`
- `daq_dtcr`
- `daq_tmpl`
- `daq_cstm`

##### ADC-Level Keys

Found in the response under key `vars`:

- `a_enable`
- `a_pol`
- `a_fgain`
- `a_trim`
- `a_dcofst`
- `t_on`
- `t_thres`
- `t_diff`
- `t_int`
- `p_int`
- `p_diff`
- `p_delay`
- `p_polec1`
- `wfr_smpl`
- `wfr_pret`
- `wfr_mode`
- `sim_ena`
- `sim_enat`
- `sim_enar`
- `sim_pol`
- `sim_rise`
- `sim_amp`
- `sim_rate`
- `sim_cyc`
- `sim_dly0`
- `sim_dly1`
- `sim_dly2`
- `sim_dly3`
- `sim_amp0`
- `sim_amp1`
- `sim_amp2`
- `sim_amp3`
- `dtsclr_b`
- `trsclr_b`
- `cfd_dly`
- `rt_d0`
- `rt_d1`
- `rt_d10`
- `rt_d100`
- `rt_acpt`
- `rt_rqst`
- `rt_dwav`
- `rt_dbsy`
- `rt_dqt`
- `rt_dtrg`
- `rt_dded`
- `st_trig`
- `st_trigr`
- `st_btrig`
- `st_bwv`
- `st_bqt`
- `st_bevr`
- `st_bevw`
- `prg_ddtm`
- `det_type`
- `syn_lvtm`
- `syn_ddtm`
- `daq_chnm`
- `daq_wrTp`
- `daq_clrC`