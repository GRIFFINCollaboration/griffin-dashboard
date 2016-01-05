#widget-rateBar

`<widget-rateBar>` provides a write interface to the GRIF16 digitizers listed in the ODB's `/DAQ/hosts` table.  The element requires no attributes.

##Setup
`<widget-rateBar>` assumes the ODB's `/DAQ` directory is present in object form on `window.currentData.DAQ`.

##Usage
`<widget-rateBar>` is populated by a single custom event listener, `postADC`, which expects an `event.detail` as the following object:
```
{'channel' : cellName}
```
where `cellName` is the 10-character [standard nomenclature](https://www.triumf.info/wiki/tigwiki/index.php/Detector_Nomenclature) string for a single detector element.

Upon receipt of this event, the element will populate all its form fields with the current values of the ADC channel determined to correspond to `cellName`, and expose that channel for writing.

##Parameters

The following list of 'string' `code` pairs associates the field as labeled 'string' in `<widget-rateBar>` to the corresponding value in the [GRIF16 documentation]() labeled by `code`.

###MSCB Node Info

Unlike everything else, the information in this panel is read only, summarizes board level status, and comes from node 1 on the digitizer (as opposed to node 2+i for the ith ADC).

 - Control Bits `ctrl` 
 - Revision No. `rev`
 - Serial No. `serial`
 - FPGA Temperature `cpu_temp`
 - Clock Cleaner Locked Status `cc_lock`
 - Clock Cleaner Frequency`cc_freq`
 - Hardware / Software Match`hw_sw_m`
 - Hardware ID `hw_id`
 - Hardware Timestamp `hw_time`
 - Software ID `sw_id`
 - Software Timestamp `sw_time`
 - Uptime `uptime`
 - ??? `dac_ch`
 - Reference Clock `ref_clk`
 - Enabled Channels `ch_en`
 - Enabled ADCs `ch_aa`

###ADC Control
 - DC Offset `a_dcofst`
 - ADC Chan `a_off`
 - Trim `a_trim`
 - Polarity `a_pol`

###Triggering
 - Channel `t_off`
 - Hit Thresh `t_hthresh`
 - Trig Thresh `t_thresh`
 - Differentiation `t_diff`
 - Integration `t_int`
 - Delay `t_delay`
 - Pole Cxn `t_polcor`
 - BLR Control `t_blrctl`

###Pulse Height Eval.
 - Integration `p_int`
 - Differentiation `p_diff`
 - Delay `p_delay`
 - Pole Cxn 1 `p_polec1`
 - Pole Cxn 2 `p_polec2`
 - Baseline Rest `p_bsr`
 - Gain `p_gain`
 - Pileup Algo `p_pactrl`

###Time Eval.
 - CFD Delay `cfd_dly`
 - CFD Fraction `cfd_frac`

###Waveform Readout
 - (Suppressed / Unsuppressed buttons) `wfr_supp`
 - Pretrigger `wfr_pret`
 - Samples `wfr_smpl`
 - Decimation `wfr_dec`
 - Filter Waveform `wfr_off`

###Simulation Pulse
 - (Enabled / Disabled) `sim_ena`
 - Pulse Height `sim_phgt`
 - Risetime `sim_rise`
 - Falltime `sim_fall`
 - Rate `sim_rate`
 - Period `sim_rand`

###Miscelaneous
 - Fixed Deadtime `fix_dead`
 - Detector Type `det_type`
