import * as circuit_json from 'circuit-json';
import { AnyCircuitElement } from 'circuit-json';
import * as zod from 'zod';
import * as _tscircuit_props from '@tscircuit/props';
import { PartsEngine, FetchPartAvailabilityParams } from '@tscircuit/props';
export { FetchPartAvailabilityParams, PartAvailability } from '@tscircuit/props';

type PlatformFetch = (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => ReturnType<typeof fetch>;

type FetchPartCircuitJsonParams = {
    supplierPartNumber?: string;
    manufacturerPartNumber?: string;
    platformFetch?: PlatformFetch;
    /** Overrides the engine default for this import. */
    includeDatasheetInformation?: boolean;
};

type EasyEdaProxyConfig = {
    proxyEndpointUrl: string;
    headers?: Record<string, string>;
};
type JlcPcbPartsEngineOptions = {
    platformFetch?: PlatformFetch;
    jlcSearchBaseUrl?: string;
    easyEdaProxyConfig?: EasyEdaProxyConfig;
    /** Include registry pin attributes in imported source ports. Defaults to false. */
    includeDatasheetInformation?: boolean;
    /** Registry endpoint, independent of the EasyEDA proxy. */
    datasheetApiBaseUrl?: string;
};

declare class JlcPcbPartsEngine implements PartsEngine {
    private readonly defaultPlatformFetch;
    private readonly easyEdaProxyConfig;
    private readonly jlcSearchBaseUrl;
    private readonly getJlcPartsCached;
    private readonly includeDatasheetInformation;
    private readonly fetchDatasheetInformation;
    constructor({ platformFetch: defaultPlatformFetch, easyEdaProxyConfig, jlcSearchBaseUrl, includeDatasheetInformation, datasheetApiBaseUrl, }?: JlcPcbPartsEngineOptions);
    fetchPartAvailability(request: FetchPartAvailabilityParams): Promise<_tscircuit_props.PartAvailability | undefined>;
    private getEasyEdaPlatformFetch;
    findPart({ sourceComponent, footprinterString, }: Parameters<PartsEngine["findPart"]>[0]): Promise<{
        jlcpcb: string[];
    } | {
        jlcpcb?: undefined;
    }>;
    fetchPartCircuitJson({ supplierPartNumber, manufacturerPartNumber, platformFetch: platformFetchOverride, includeDatasheetInformation, }: FetchPartCircuitJsonParams): Promise<({
        message: string;
        type: "source_runtime_error";
        error_type: "source_runtime_error";
        source_runtime_error_id: string;
        phase_name?: string | undefined;
    } | {
        type: "source_datasheet";
        manufacturer_part_number: string;
        source_datasheet_id: string;
        datasheet_pdf_urls: string[];
        description?: string | undefined;
    } | {
        type: "source_trace";
        source_trace_id: string;
        connected_source_port_ids: string[];
        connected_source_net_ids: string[];
        name?: string | undefined;
        subcircuit_id?: string | undefined;
        max_length?: number | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        display_name?: string | undefined;
        max_via_count?: number | undefined;
        min_trace_thickness?: number | undefined;
    } | {
        type: "source_bus";
        source_bus_id: string;
        source_trace_ids: string[];
        name?: string | undefined;
        subcircuit_id?: string | undefined;
        min_length?: number | {
            reference: "longest_manhattan";
            offset?: number | undefined;
            source_trace_ids?: string[] | undefined;
        } | undefined;
        max_length?: number | {
            reference: "longest_manhattan";
            offset?: number | undefined;
            source_trace_ids?: string[] | undefined;
        } | undefined;
        target_length?: number | {
            reference: "longest_manhattan";
            offset?: number | undefined;
            source_trace_ids?: string[] | undefined;
        } | undefined;
        pcb_trace_spacing?: number | {
            width_multiplier: number;
        } | undefined;
        pcb_spacing_to_other_signals?: number | {
            width_multiplier: number;
        } | undefined;
        length_tolerance?: number | undefined;
        target_impedance?: number | undefined;
        max_length_skew?: number | undefined;
        target_differential_impedance?: number | undefined;
        differential_pair?: {
            positive_source_trace_id: string;
            negative_source_trace_id: string;
            trace_gap?: number | undefined;
            max_uncoupled_length?: number | undefined;
        } | undefined;
        length_match_source_trace_ids?: string[] | undefined;
        target_impedance_min?: number | undefined;
        target_impedance_max?: number | undefined;
        target_differential_impedance_min?: number | undefined;
        target_differential_impedance_max?: number | undefined;
    } | {
        type: "source_port";
        name: string;
        source_port_id: string;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        port_hints?: string[] | undefined;
        highlight_color?: string | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        source_group_id?: string | undefined;
        pin_number?: number | undefined;
        is_input?: boolean | undefined;
        is_output?: boolean | undefined;
        is_bidirectional?: boolean | undefined;
        is_passive?: boolean | undefined;
        can_use_tri_state?: boolean | undefined;
        is_using_tri_state?: boolean | undefined;
        can_use_open_collector?: boolean | undefined;
        is_using_open_collector?: boolean | undefined;
        can_use_open_emitter?: boolean | undefined;
        is_using_open_emitter?: boolean | undefined;
        is_gpio?: boolean | undefined;
        must_be_connected?: boolean | undefined;
        provides_power?: boolean | undefined;
        requires_power?: boolean | undefined;
        provides_ground?: boolean | undefined;
        requires_ground?: boolean | undefined;
        provides_voltage?: number | undefined;
        requires_voltage?: number | undefined;
        required_voltage_tolerance?: number | undefined;
        do_not_connect?: boolean | undefined;
        include_in_board_pinout?: boolean | undefined;
        can_use_internal_pullup?: boolean | undefined;
        is_using_internal_pullup?: boolean | undefined;
        needs_external_pullup?: boolean | undefined;
        can_use_internal_pulldown?: boolean | undefined;
        is_using_internal_pulldown?: boolean | undefined;
        needs_external_pulldown?: boolean | undefined;
        can_use_open_drain?: boolean | undefined;
        is_using_open_drain?: boolean | undefined;
        can_use_push_pull?: boolean | undefined;
        is_using_push_pull?: boolean | undefined;
        should_have_decoupling_capacitor?: boolean | undefined;
        recommended_decoupling_capacitor_capacitance?: string | number | undefined;
        is_configured_for_i2c_sda?: boolean | undefined;
        is_configured_for_i2c_scl?: boolean | undefined;
        is_configured_for_spi_mosi?: boolean | undefined;
        is_configured_for_spi_miso?: boolean | undefined;
        is_configured_for_spi_sck?: boolean | undefined;
        is_configured_for_spi_cs?: boolean | undefined;
        is_configured_for_uart_tx?: boolean | undefined;
        is_configured_for_uart_rx?: boolean | undefined;
        supports_i2c_sda?: boolean | undefined;
        supports_i2c_scl?: boolean | undefined;
        supports_spi_mosi?: boolean | undefined;
        supports_spi_miso?: boolean | undefined;
        supports_spi_sck?: boolean | undefined;
        supports_spi_cs?: boolean | undefined;
        supports_uart_tx?: boolean | undefined;
        supports_uart_rx?: boolean | undefined;
        most_frequently_referenced_by_name?: string | undefined;
    } | {
        type: "source_component_internal_connection";
        source_component_id: string;
        source_port_ids: string[];
        source_component_internal_connection_id: string;
        subcircuit_id?: string | undefined;
    } | {
        type: "source_datasheet";
        manufacturer_part_number: string;
        source_datasheet_id: string;
        datasheet_pdf_urls: string[];
        description?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        resistance: number;
        ftype: "simple_resistor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        display_resistance?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        capacitance: number;
        ftype: "simple_capacitor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        max_voltage_rating?: number | undefined;
        display_capacitance?: string | undefined;
        max_decoupling_trace_length?: number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_diode";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_fiducial";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_led";
        subcircuit_id?: string | undefined;
        color?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        wavelength?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_ground";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_chip";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "printedpart";
        subcircuit_id?: string | undefined;
        material?: "pla" | "petg" | "nylon" | undefined;
        color?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "subassembly";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "motor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        voltage: number;
        ftype: "simple_power_source";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        wave_shape: "square" | "triangle" | "sawtooth" | "sine" | "dc";
        current: number;
        ftype: "simple_current_source";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        frequency?: number | undefined;
        phase?: number | undefined;
        duty_cycle?: number | undefined;
        peak_to_peak_current?: number | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_ammeter";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_battery";
        capacity: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        inductance: number;
        ftype: "simple_inductor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        display_inductance?: string | undefined;
        max_current_rating?: number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_push_button";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_potentiometer";
        max_resistance: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        display_max_resistance?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        frequency: number;
        ftype: "simple_crystal";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        load_capacitance?: number | undefined;
        pin_variant?: "two_pin" | "four_pin" | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_pin_header";
        pin_count: number;
        gender: "male" | "female";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_connector";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        pin_count?: number | undefined;
        standard?: "usb_c" | "m2" | "jst_sh" | "jst_gh" | "jst_zh" | "jst_ph" | "jst_xh" | "jst_vh" | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_pinout";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        frequency: number;
        ftype: "simple_resonator";
        load_capacitance: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        equivalent_series_resistance?: number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_switch";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_transistor";
        transistor_type: "npn" | "pnp";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_test_point";
        width?: string | number | undefined;
        height?: string | number | undefined;
        subcircuit_id?: string | undefined;
        hole_diameter?: string | number | undefined;
        pad_shape?: "circle" | "rect" | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        footprint_variant?: "through_hole" | "pad" | undefined;
        pad_diameter?: string | number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_mosfet";
        channel_type: "n" | "p";
        mosfet_mode: "enhancement" | "depletion";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_op_amp";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_fuse";
        current_rating_amps: number;
        voltage_rating_volts: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_voltage_probe";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "interconnect";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        voltage: number;
        ftype: "simple_voltage_source";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        frequency?: number | undefined;
        peak_to_peak_voltage?: number | undefined;
        wave_shape?: "square" | "sinewave" | "triangle" | "sawtooth" | undefined;
        phase?: number | undefined;
        duty_cycle?: number | undefined;
        pulse_delay?: number | undefined;
        rise_time?: number | undefined;
        fall_time?: number | undefined;
        pulse_width?: number | undefined;
        period?: number | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_project_metadata";
        name?: string | undefined;
        software_used_string?: string | undefined;
        project_url?: string | undefined;
        source_filesystem_md5_hash?: string | undefined;
        created_at?: string | undefined;
    } | {
        message: string;
        type: "source_missing_property_error";
        source_component_id: string;
        error_type: "source_missing_property_error";
        source_missing_property_error_id: string;
        property_name: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "source_invalid_component_property_error";
        source_component_id: string;
        error_type: "source_invalid_component_property_error";
        property_name: string;
        source_invalid_component_property_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        property_value?: unknown;
        expected_format?: string | undefined;
    } | {
        message: string;
        type: "source_failed_to_create_component_error";
        error_type: "source_failed_to_create_component_error";
        source_failed_to_create_component_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        pcb_center?: {
            x?: number | undefined;
            y?: number | undefined;
        } | undefined;
        component_name?: string | undefined;
        parent_source_component_id?: string | undefined;
        schematic_center?: {
            x?: number | undefined;
            y?: number | undefined;
        } | undefined;
    } | {
        message: string;
        type: "source_trace_not_connected_error";
        error_type: "source_trace_not_connected_error";
        source_trace_not_connected_error_id: string;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        is_fatal?: boolean | undefined;
        source_group_id?: string | undefined;
        connected_source_port_ids?: string[] | undefined;
        selectors_not_found?: string[] | undefined;
    } | {
        message: string;
        type: "source_property_ignored_warning";
        source_component_id: string;
        error_type: "source_property_ignored_warning";
        property_name: string;
        source_property_ignored_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_pin_missing_trace_warning";
        source_component_id: string;
        source_port_id: string;
        warning_type: "source_pin_missing_trace_warning";
        source_pin_missing_trace_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_missing_manufacturer_part_number_warning";
        source_component_id: string;
        warning_type: "source_missing_manufacturer_part_number_warning";
        source_missing_manufacturer_part_number_warning_id: string;
        subcircuit_id?: string | undefined;
        standard?: string | undefined;
    } | {
        message: string;
        type: "source_refdes_convention_warning";
        source_component_id: string;
        warning_type: "source_refdes_convention_warning";
        source_refdes_convention_warning_id: string;
        refdes: string;
        source_component_ftype: string;
        expected_prefixes: string[];
        subcircuit_id?: string | undefined;
        actual_prefix?: string | undefined;
    } | {
        message: string;
        type: "source_component_availability_warning";
        source_component_id: string;
        warning_type: "source_component_availability_warning";
        supplier_name: "jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc";
        supplier_part_numbers: [string, ...string[]];
        source_component_availability_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_i2c_misconfigured_error";
        error_type: "source_i2c_misconfigured_error";
        source_i2c_misconfigured_error_id: string;
        source_port_ids: string[];
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "source_component_misconfigured_error";
        error_type: "source_component_misconfigured_error";
        source_component_misconfigured_error_id: string;
        source_component_ids: string[];
        is_fatal?: boolean | undefined;
        source_port_ids?: string[] | undefined;
    } | {
        type: "source_net";
        name: string;
        source_net_id: string;
        member_source_group_ids: string[];
        trace_width?: number | undefined;
        subcircuit_id?: string | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        is_power?: boolean | undefined;
        is_ground?: boolean | undefined;
        is_digital_signal?: boolean | undefined;
        is_analog_signal?: boolean | undefined;
        is_positive_voltage_source?: boolean | undefined;
    } | {
        type: "source_group";
        source_group_id: string;
        name?: string | undefined;
        subcircuit_id?: string | undefined;
        is_subcircuit?: boolean | undefined;
        show_as_schematic_box?: boolean | undefined;
        parent_subcircuit_id?: string | undefined;
        parent_source_group_id?: string | undefined;
        was_automatically_named?: boolean | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_chip";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        capacitance: number;
        ftype: "simple_capacitor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        max_voltage_rating?: number | undefined;
        display_capacitance?: string | undefined;
        max_decoupling_trace_length?: number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_diode";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_led";
        subcircuit_id?: string | undefined;
        color?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        wavelength?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        resistance: number;
        ftype: "simple_resistor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        display_resistance?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        voltage: number;
        ftype: "simple_power_source";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_battery";
        capacity: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        inductance: number;
        ftype: "simple_inductor";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        display_inductance?: string | undefined;
        max_current_rating?: number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_pin_header";
        pin_count: number;
        gender: "male" | "female";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_pinout";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        frequency: number;
        ftype: "simple_resonator";
        load_capacitance: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        equivalent_series_resistance?: number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_switch";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_transistor";
        transistor_type: "npn" | "pnp";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_test_point";
        width?: string | number | undefined;
        height?: string | number | undefined;
        subcircuit_id?: string | undefined;
        hole_diameter?: string | number | undefined;
        pad_shape?: "circle" | "rect" | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        footprint_variant?: "through_hole" | "pad" | undefined;
        pad_diameter?: string | number | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_mosfet";
        channel_type: "n" | "p";
        mosfet_mode: "enhancement" | "depletion";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_op_amp";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_potentiometer";
        max_resistance: number;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
        display_max_resistance?: string | undefined;
    } | {
        type: "source_component";
        name: string;
        source_component_id: string;
        ftype: "simple_push_button";
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        display_name?: string | undefined;
        manufacturer_part_number?: string | undefined;
        supplier_part_numbers?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", string[]>> | undefined;
        display_value?: string | undefined;
        are_pins_interchangeable?: boolean | undefined;
        internally_connected_source_port_ids?: string[][] | undefined;
    } | {
        type: "source_pcb_ground_plane";
        source_net_id: string;
        source_group_id: string;
        source_pcb_ground_plane_id: string;
        subcircuit_id?: string | undefined;
    } | {
        type: "source_manually_placed_via";
        source_group_id: string;
        source_manually_placed_via_id: string;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        type: "source_board";
        source_group_id: string;
        source_board_id: string;
        title?: string | undefined;
    } | {
        type: "source_project_metadata";
        name?: string | undefined;
        software_used_string?: string | undefined;
        project_url?: string | undefined;
        source_filesystem_md5_hash?: string | undefined;
        created_at?: string | undefined;
    } | {
        message: string;
        type: "source_invalid_component_property_error";
        source_component_id: string;
        error_type: "source_invalid_component_property_error";
        property_name: string;
        source_invalid_component_property_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        property_value?: unknown;
        expected_format?: string | undefined;
    } | {
        message: string;
        type: "source_trace_not_connected_error";
        error_type: "source_trace_not_connected_error";
        source_trace_not_connected_error_id: string;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        is_fatal?: boolean | undefined;
        source_group_id?: string | undefined;
        connected_source_port_ids?: string[] | undefined;
        selectors_not_found?: string[] | undefined;
    } | {
        message: string;
        type: "source_pin_missing_trace_warning";
        source_component_id: string;
        source_port_id: string;
        warning_type: "source_pin_missing_trace_warning";
        source_pin_missing_trace_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_unnamed_trace_warning";
        source_trace_id: string;
        warning_type: "source_unnamed_trace_warning";
        source_unnamed_trace_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_confusing_net_name_warning";
        warning_type: "source_confusing_net_name_warning";
        source_confusing_net_name_warning_id: string;
        source_net_ids: string[];
        net_name: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_missing_manufacturer_part_number_warning";
        source_component_id: string;
        warning_type: "source_missing_manufacturer_part_number_warning";
        source_missing_manufacturer_part_number_warning_id: string;
        subcircuit_id?: string | undefined;
        standard?: string | undefined;
    } | {
        message: string;
        type: "source_component_availability_warning";
        source_component_id: string;
        warning_type: "source_component_availability_warning";
        supplier_name: "jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc";
        supplier_part_numbers: [string, ...string[]];
        source_component_availability_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_refdes_convention_warning";
        source_component_id: string;
        warning_type: "source_refdes_convention_warning";
        source_refdes_convention_warning_id: string;
        refdes: string;
        source_component_ftype: string;
        expected_prefixes: string[];
        subcircuit_id?: string | undefined;
        actual_prefix?: string | undefined;
    } | {
        message: string;
        type: "source_no_power_pin_defined_warning";
        source_component_id: string;
        warning_type: "source_no_power_pin_defined_warning";
        source_port_ids: string[];
        source_no_power_pin_defined_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_no_ground_pin_defined_warning";
        source_component_id: string;
        warning_type: "source_no_ground_pin_defined_warning";
        source_port_ids: string[];
        source_no_ground_pin_defined_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_component_pins_underspecified_warning";
        source_component_id: string;
        warning_type: "source_component_pins_underspecified_warning";
        source_port_ids: string[];
        source_component_pins_underspecified_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "source_pin_must_be_connected_error";
        source_component_id: string;
        source_port_id: string;
        error_type: "source_pin_must_be_connected_error";
        source_pin_must_be_connected_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "unknown_error_finding_part";
        error_type: "unknown_error_finding_part";
        unknown_error_finding_part_id: string;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "source_part_not_found_warning";
        warning_type: "source_part_not_found_warning";
        source_part_not_found_warning_id: string;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        supplier_name?: "jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc" | undefined;
        supplier_part_number?: string | undefined;
        manufacturer_part_number?: string | undefined;
        part_name?: string | undefined;
    } | {
        message: string;
        type: "source_i2c_misconfigured_error";
        error_type: "source_i2c_misconfigured_error";
        source_i2c_misconfigured_error_id: string;
        source_port_ids: string[];
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "source_component_misconfigured_error";
        error_type: "source_component_misconfigured_error";
        source_component_misconfigured_error_id: string;
        source_component_ids: string[];
        is_fatal?: boolean | undefined;
        source_port_ids?: string[] | undefined;
    } | {
        message: string;
        type: "source_ambiguous_port_reference";
        error_type: "source_ambiguous_port_reference";
        source_ambiguous_port_reference_id: string;
        source_component_id?: string | undefined;
        source_port_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        type: "pcb_component";
        width: number;
        height: number;
        rotation: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        source_component_id: string;
        obstructs_within_bounds: boolean;
        display_offset_x?: string | undefined;
        display_offset_y?: string | undefined;
        do_not_place?: boolean | undefined;
        is_allowed_to_be_off_board?: boolean | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        position_mode?: "packed" | "relative_to_group_anchor" | "relative_to_another_component" | "none" | undefined;
        anchor_position?: {
            x: number;
            y: number;
        } | undefined;
        anchor_alignment?: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right" | undefined;
        positioned_relative_to_pcb_group_id?: string | undefined;
        positioned_relative_to_pcb_board_id?: string | undefined;
        cable_insertion_center?: {
            x: number;
            y: number;
        } | undefined;
        insertion_direction?: "from_left" | "from_right" | "from_top" | "from_bottom" | "from_above" | "from_below" | undefined;
        pin1_location?: "leftside_top" | "leftside_bottom" | "rightside_top" | "rightside_bottom" | "topside_left" | "topside_right" | "bottomside_left" | "bottomside_right" | undefined;
        supplier_pin1_location_map?: Partial<Record<"jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc", "leftside_top" | "leftside_bottom" | "rightside_top" | "rightside_bottom" | "topside_left" | "topside_right" | "bottomside_left" | "bottomside_right">> | undefined;
        metadata?: {
            kicad_footprint?: {
                layer?: string | undefined;
                footprintName?: string | undefined;
                version?: string | number | undefined;
                generator?: string | undefined;
                generatorVersion?: string | number | undefined;
                properties?: {
                    Reference?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        layer?: string | undefined;
                        uuid?: string | undefined;
                        hide?: boolean | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    Value?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        layer?: string | undefined;
                        uuid?: string | undefined;
                        hide?: boolean | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    Datasheet?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        layer?: string | undefined;
                        uuid?: string | undefined;
                        hide?: boolean | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    Description?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        layer?: string | undefined;
                        uuid?: string | undefined;
                        hide?: boolean | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                } | undefined;
                attributes?: {
                    through_hole?: boolean | undefined;
                    smd?: boolean | undefined;
                    exclude_from_pos_files?: boolean | undefined;
                    exclude_from_bom?: boolean | undefined;
                } | undefined;
                pads?: {
                    type: string;
                    name: string;
                    at?: {
                        x: number;
                        y: number;
                        rotation?: number | undefined;
                    } | undefined;
                    shape?: string | undefined;
                    size?: {
                        x: number;
                        y: number;
                    } | undefined;
                    uuid?: string | undefined;
                    drill?: number | undefined;
                    layers?: string[] | undefined;
                    removeUnusedLayers?: boolean | undefined;
                }[] | undefined;
                embeddedFonts?: boolean | undefined;
                model?: {
                    path: string;
                    offset?: {
                        x: number;
                        y: number;
                        z: number;
                    } | undefined;
                    scale?: {
                        x: number;
                        y: number;
                        z: number;
                    } | undefined;
                    rotate?: {
                        x: number;
                        y: number;
                        z: number;
                    } | undefined;
                } | undefined;
            } | undefined;
        } | undefined;
    } | {
        type: "pcb_debug_object";
        shape: "rect";
        size: {
            width: number;
            height: number;
        };
        center: {
            x: number;
            y: number;
        };
        pcb_debug_object_id: string;
        subcircuit_id?: string | undefined;
        label?: string | undefined;
    } | {
        type: "pcb_debug_object";
        shape: "line";
        pcb_debug_object_id: string;
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
        subcircuit_id?: string | undefined;
        label?: string | undefined;
    } | {
        type: "pcb_debug_object";
        shape: "point";
        center: {
            x: number;
            y: number;
        };
        pcb_debug_object_id: string;
        subcircuit_id?: string | undefined;
        label?: string | undefined;
    } | {
        type: "pcb_hole";
        x: number;
        y: number;
        pcb_hole_id: string;
        hole_shape: "circle" | "square";
        hole_diameter: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
    } | {
        type: "pcb_hole";
        x: number;
        y: number;
        pcb_hole_id: string;
        hole_shape: "oval";
        hole_width: number;
        hole_height: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
    } | {
        type: "pcb_hole";
        x: number;
        y: number;
        pcb_hole_id: string;
        hole_shape: "pill";
        hole_width: number;
        hole_height: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
    } | {
        type: "pcb_hole";
        x: number;
        y: number;
        ccw_rotation: number;
        pcb_hole_id: string;
        hole_shape: "rotated_pill";
        hole_width: number;
        hole_height: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
    } | {
        type: "pcb_hole";
        x: number;
        y: number;
        pcb_hole_id: string;
        hole_shape: "circle";
        hole_diameter: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
    } | {
        type: "pcb_hole";
        x: number;
        y: number;
        pcb_hole_id: string;
        hole_shape: "rect";
        hole_width: number;
        hole_height: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
    } | {
        message: string;
        type: "pcb_missing_footprint_error";
        source_component_id: string;
        error_type: "pcb_missing_footprint_error";
        pcb_missing_footprint_error_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "external_footprint_load_error";
        pcb_component_id: string;
        source_component_id: string;
        error_type: "external_footprint_load_error";
        external_footprint_load_error_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_fatal?: boolean | undefined;
        footprinter_string?: string | undefined;
    } | {
        message: string;
        type: "circuit_json_footprint_load_error";
        pcb_component_id: string;
        source_component_id: string;
        error_type: "circuit_json_footprint_load_error";
        circuit_json_footprint_load_error_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_fatal?: boolean | undefined;
        circuit_json?: any[] | undefined;
    } | {
        message: string;
        type: "pcb_manual_edit_conflict_warning";
        pcb_component_id: string;
        source_component_id: string;
        warning_type: "pcb_manual_edit_conflict_warning";
        pcb_manual_edit_conflict_warning_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_connector_not_in_accessible_orientation_warning";
        pcb_component_id: string;
        warning_type: "pcb_connector_not_in_accessible_orientation_warning";
        pcb_connector_not_in_accessible_orientation_warning_id: string;
        facing_direction: "x-" | "x+" | "y+" | "y-";
        recommended_facing_direction: "x-" | "x+" | "y+" | "y-";
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_board_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_component_missing_courtyard_warning";
        pcb_component_id: string;
        warning_type: "pcb_component_missing_courtyard_warning";
        pcb_component_missing_courtyard_warning_id: string;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "supplier_footprint_mismatch_warning";
        source_component_id: string;
        warning_type: "supplier_footprint_mismatch_warning";
        supplier_footprint_mismatch_warning_id: string;
        footprint_copper_intersection_over_union: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        supplier_name?: "jlcpcb" | "macrofab" | "pcbway" | "digikey" | "mouser" | "lcsc" | undefined;
        supplier_part_number?: string | undefined;
        supplier_footprint_url?: string | undefined;
    } | {
        message: string;
        type: "pcb_fabricator_extra_charge_warning";
        warning_type: "pcb_fabricator_extra_charge_warning";
        pcb_fabricator_extra_charge_warning_id: string;
        fabricator_preset: string;
        subcircuit_id?: string | undefined;
        pcb_board_id?: string | undefined;
        pcb_via_ids?: string[] | undefined;
    } | {
        type: "pcb_plated_hole";
        x: number;
        y: number;
        shape: "circle";
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_diameter: number;
        outer_diameter: number;
        pcb_plated_hole_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
    } | {
        type: "pcb_plated_hole";
        x: number;
        y: number;
        shape: "oval" | "pill";
        ccw_rotation: number;
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_width: number;
        hole_height: number;
        pcb_plated_hole_id: string;
        outer_width: number;
        outer_height: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
    } | {
        type: "pcb_plated_hole";
        x: number;
        y: number;
        shape: "circular_hole_with_rect_pad";
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_shape: "circle";
        hole_diameter: number;
        pcb_plated_hole_id: string;
        pad_shape: "rect";
        rect_pad_width: number;
        rect_pad_height: number;
        hole_offset_x: number;
        hole_offset_y: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        rect_border_radius?: number | undefined;
        rect_ccw_rotation?: number | undefined;
    } | {
        type: "pcb_plated_hole";
        x: number;
        y: number;
        shape: "pill_hole_with_rect_pad";
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_shape: "pill";
        hole_width: number;
        hole_height: number;
        pcb_plated_hole_id: string;
        pad_shape: "rect";
        rect_pad_width: number;
        rect_pad_height: number;
        hole_offset_x: number;
        hole_offset_y: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        rect_border_radius?: number | undefined;
    } | {
        type: "pcb_plated_hole";
        x: number;
        y: number;
        shape: "rotated_pill_hole_with_rect_pad";
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_shape: "rotated_pill";
        hole_width: number;
        hole_height: number;
        pcb_plated_hole_id: string;
        pad_shape: "rect";
        rect_pad_width: number;
        rect_pad_height: number;
        hole_offset_x: number;
        hole_offset_y: number;
        rect_ccw_rotation: number;
        hole_ccw_rotation: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        rect_border_radius?: number | undefined;
    } | {
        type: "pcb_plated_hole";
        x: number;
        y: number;
        shape: "hole_with_polygon_pad";
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_shape: "circle" | "oval" | "pill" | "rotated_pill";
        pcb_plated_hole_id: string;
        hole_offset_x: number;
        hole_offset_y: number;
        pad_outline: {
            x: number;
            y: number;
        }[];
        ccw_rotation?: number | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        hole_diameter?: number | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        hole_width?: number | undefined;
        hole_height?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
    } | {
        type: "pcb_keepout";
        width: number;
        height: number;
        shape: "rect";
        layers: string[];
        center: {
            x: number;
            y: number;
        };
        pcb_keepout_id: string;
        description?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        excluded_pcb_component_ids?: string[] | undefined;
        warning_only?: boolean | undefined;
        allow_traces?: boolean | undefined;
        allow_placements?: boolean | undefined;
    } | {
        type: "pcb_keepout";
        shape: "circle";
        radius: number;
        layers: string[];
        center: {
            x: number;
            y: number;
        };
        pcb_keepout_id: string;
        description?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        excluded_pcb_component_ids?: string[] | undefined;
        warning_only?: boolean | undefined;
        allow_traces?: boolean | undefined;
        allow_placements?: boolean | undefined;
    } | {
        type: "pcb_keepout";
        shape: "outline";
        layers: string[];
        outline: {
            x: number;
            y: number;
        }[];
        stroke_width: number;
        pcb_keepout_id: string;
        description?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        excluded_pcb_component_ids?: string[] | undefined;
        warning_only?: boolean | undefined;
        allow_traces?: boolean | undefined;
        allow_placements?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_keepout_overlap_warning";
        warning_type: "pcb_keepout_overlap_warning";
        pcb_keepout_id: string;
        pcb_keepout_overlap_warning_id: string;
        center?: {
            x: number;
            y: number;
        } | undefined;
        subcircuit_id?: string | undefined;
        pcb_component_ids?: string[] | undefined;
        pcb_trace_ids?: string[] | undefined;
        pcb_smtpad_ids?: string[] | undefined;
        pcb_plated_hole_ids?: string[] | undefined;
        pcb_via_ids?: string[] | undefined;
    } | {
        type: "pcb_port";
        x: number;
        y: number;
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        pcb_port_id: string;
        source_port_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_board_pinout?: boolean | undefined;
    } | {
        type: "pcb_net";
        pcb_net_id: string;
        highlight_color?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        type: "pcb_text";
        width: number;
        height: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        center: {
            x: number;
            y: number;
        };
        pcb_text_id: string;
        text: string;
        lines: number;
        align: "bottom-left";
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_trace";
        pcb_trace_id: string;
        route: ({
            x: number;
            y: number;
            width: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            route_type: "wire";
            start_width?: number | undefined;
            end_width?: number | undefined;
            width_interpolation_mode?: "linear" | "quadratic" | undefined;
            copper_pour_id?: string | undefined;
            is_inside_copper_pour?: boolean | undefined;
            start_pcb_port_id?: string | undefined;
            end_pcb_port_id?: string | undefined;
        } | {
            x: number;
            y: number;
            to_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            route_type: "via";
            from_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            hole_diameter?: number | undefined;
            outer_diameter?: number | undefined;
            copper_pour_id?: string | undefined;
            is_inside_copper_pour?: boolean | undefined;
            tented_on_top?: boolean | undefined;
            tented_on_bottom?: boolean | undefined;
        } | {
            width: number;
            start: {
                x: number;
                y: number;
            };
            end: {
                x: number;
                y: number;
            };
            route_type: "through_pad";
            start_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            end_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_plated_hole_id?: string | undefined;
            pcb_smtpad_id?: string | undefined;
        })[];
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        source_trace_id?: string | undefined;
        route_thickness_mode?: "constant" | "interpolated" | undefined;
        route_order_index?: number | undefined;
        should_round_corners?: boolean | undefined;
        trace_length?: number | undefined;
        is_antenna_trace?: boolean | undefined;
        highlight_color?: string | undefined;
    } | {
        message: string;
        type: "pcb_trace_warning";
        source_trace_id: string;
        pcb_trace_id: string;
        pcb_trace_warning_id: string;
        warning_type: "pcb_trace_warning";
        pcb_component_ids: string[];
        pcb_port_ids: string[];
        center?: {
            x: number;
            y: number;
        } | undefined;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_trace_style_warning";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        center: {
            x: number;
            y: number;
        };
        pcb_trace_id: string;
        warning_type: "pcb_trace_style_warning";
        pcb_trace_style_warning_id: string;
        styling_issue_type: "long_segment_at_odd_angle";
        start_route_index: number;
        end_route_index: number;
        segment_start: {
            x: number;
            y: number;
        };
        segment_end: {
            x: number;
            y: number;
        };
        segment_length: number;
        minimum_segment_length: number;
        angle_degrees: number;
        nearest_allowed_angle_degrees: number;
        angle_deviation_degrees: number;
        angle_tolerance_degrees: number;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_trace_too_long_warning";
        pcb_trace_id: string;
        warning_type: "pcb_trace_too_long_warning";
        actual_trace_length: number;
        maximum_trace_length: number;
        pcb_trace_too_long_warning_id: string;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_trace_too_long_error";
        pcb_trace_id: string;
        pcb_trace_too_long_error_id: string;
        error_type: "pcb_trace_too_long_error";
        actual_trace_length: number;
        maximum_trace_length: number;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_length_skew_error";
        error_type: "pcb_bus_length_skew_error";
        pcb_bus_length_skew_error_id: string;
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        actual_length_skew: number;
        maximum_length_skew: number;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_trace_too_many_vias_warning";
        pcb_trace_id: string;
        warning_type: "pcb_trace_too_many_vias_warning";
        pcb_trace_too_many_vias_warning_id: string;
        actual_via_count: number;
        maximum_via_count: number;
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        type: "pcb_via";
        x: number;
        y: number;
        layers: ("top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8")[];
        hole_diameter: number;
        outer_diameter: number;
        pcb_via_id: string;
        to_layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
        through_hole?: boolean | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        tented_on_top?: boolean | undefined;
        tented_on_bottom?: boolean | undefined;
        from_layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
        source_trace_id?: string | undefined;
        pcb_trace_id?: string | undefined;
        pcb_port_ids?: string[] | undefined;
        source_net_id?: string | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        topmost_drill_layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
        bottommost_drill_layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
        net_is_assignable?: boolean | undefined;
        net_assigned?: boolean | undefined;
    } | {
        type: "pcb_smtpad";
        x: number;
        y: number;
        shape: "circle";
        radius: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_smtpad_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        solderpaste_margin?: number | undefined;
    } | {
        type: "pcb_smtpad";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rect";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_smtpad_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        rect_border_radius?: number | undefined;
        solderpaste_margin?: number | undefined;
        corner_radius?: number | undefined;
        soldermask_margin_left?: number | undefined;
        soldermask_margin_top?: number | undefined;
        soldermask_margin_right?: number | undefined;
        soldermask_margin_bottom?: number | undefined;
    } | {
        type: "pcb_smtpad";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rotated_rect";
        ccw_rotation: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_smtpad_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        rect_border_radius?: number | undefined;
        solderpaste_margin?: number | undefined;
        corner_radius?: number | undefined;
        soldermask_margin_left?: number | undefined;
        soldermask_margin_top?: number | undefined;
        soldermask_margin_right?: number | undefined;
        soldermask_margin_bottom?: number | undefined;
    } | {
        type: "pcb_smtpad";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rotated_pill";
        radius: number;
        ccw_rotation: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_smtpad_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        solderpaste_margin?: number | undefined;
    } | {
        type: "pcb_smtpad";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "pill";
        radius: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_smtpad_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        solderpaste_margin?: number | undefined;
    } | {
        type: "pcb_smtpad";
        shape: "polygon";
        points: {
            x: number;
            y: number;
        }[];
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_smtpad_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_covered_with_solder_mask?: boolean | undefined;
        soldermask_margin?: number | undefined;
        port_hints?: string[] | undefined;
        pcb_port_id?: string | undefined;
        solderpaste_margin?: number | undefined;
    } | {
        type: "pcb_solder_paste";
        x: number;
        y: number;
        shape: "circle";
        radius: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
    } | {
        type: "pcb_solder_paste";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rect";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
    } | {
        type: "pcb_solder_paste";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "pill";
        radius: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
    } | {
        type: "pcb_solder_paste";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rotated_rect";
        ccw_rotation: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
    } | {
        type: "pcb_solder_paste";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rotated_pill";
        radius: number;
        ccw_rotation: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
    } | {
        type: "pcb_solder_paste";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "oval";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
    } | {
        type: "pcb_solder_paste";
        shape: "polygon";
        points: {
            x: number;
            y: number;
        }[];
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_solder_paste_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_smtpad_id?: string | undefined;
        holes?: {
            x: number;
            y: number;
        }[][] | undefined;
    } | {
        type: "pcb_soldermask_opening";
        x: number;
        y: number;
        shape: "circle";
        radius: number;
        layer: "top" | "bottom";
        pcb_soldermask_opening_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_soldermask_opening";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rect";
        layer: "top" | "bottom";
        pcb_soldermask_opening_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_soldermask_opening";
        x: number;
        y: number;
        width: number;
        height: number;
        shape: "rotated_rect";
        ccw_rotation: number;
        layer: "top" | "bottom";
        pcb_soldermask_opening_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_soldermask_opening";
        shape: "polygon";
        points: {
            x: number;
            y: number;
        }[];
        layer: "top" | "bottom";
        pcb_soldermask_opening_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_board";
        thickness: number;
        center: {
            x: number;
            y: number;
        };
        pcb_board_id: string;
        num_layers: number;
        material: "fr4" | "fr1" | "flex";
        width?: number | undefined;
        height?: number | undefined;
        shape?: "rect" | "polygon" | undefined;
        min_trace_width?: number | undefined;
        min_board_edge_clearance?: number | undefined;
        min_via_hole_edge_to_via_hole_edge_clearance?: number | undefined;
        min_plated_hole_drill_edge_to_drill_edge_clearance?: number | undefined;
        min_trace_to_pad_edge_clearance?: number | undefined;
        min_trace_to_hole_edge_clearance?: number | undefined;
        min_pad_edge_to_pad_edge_clearance?: number | undefined;
        min_same_net_trace_edge_to_trace_edge_clearance?: number | undefined;
        min_different_net_trace_edge_to_trace_edge_clearance?: number | undefined;
        min_via_edge_to_pad_edge_clearance?: number | undefined;
        min_via_hole_diameter?: number | undefined;
        min_via_pad_diameter?: number | undefined;
        display_offset_x?: string | undefined;
        display_offset_y?: string | undefined;
        subcircuit_id?: string | undefined;
        position_mode?: "none" | "relative_to_panel_anchor" | undefined;
        anchor_position?: {
            x: number;
            y: number;
        } | undefined;
        anchor_alignment?: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right" | undefined;
        pcb_panel_id?: string | undefined;
        carrier_pcb_board_id?: string | undefined;
        is_subcircuit?: boolean | undefined;
        is_mounted_to_carrier_board?: boolean | undefined;
        is_via_in_pad_allowed?: boolean | undefined;
        default_via_tented_on_top?: boolean | undefined;
        default_via_tented_on_bottom?: boolean | undefined;
        default_via_plugged?: boolean | undefined;
        allow_blind_and_buried_vias?: boolean | undefined;
        outline?: {
            x: number;
            y: number;
        }[] | undefined;
        solder_mask_color?: string | undefined;
        silkscreen_color?: string | undefined;
    } | {
        type: "pcb_bend";
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
        pcb_board_id: string;
        pcb_bend_id: string;
        bend_angle: number;
        bend_radius: number;
        bend_side: "left" | "right";
        name?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_stiffener";
        width: number;
        height: number;
        shape: "rect";
        thickness: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_board_id: string;
        material: "fr4" | "polyimide" | "stainless_steel" | "aluminum";
        pcb_stiffener_id: string;
        name?: string | undefined;
        rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        outline?: undefined;
        adhesive_thickness?: number | undefined;
    } | {
        type: "pcb_stiffener";
        shape: "polygon";
        thickness: number;
        layer: "top" | "bottom";
        pcb_board_id: string;
        outline: {
            x: number;
            y: number;
        }[];
        material: "fr4" | "polyimide" | "stainless_steel" | "aluminum";
        pcb_stiffener_id: string;
        width?: undefined;
        height?: undefined;
        name?: string | undefined;
        rotation?: undefined;
        center?: undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        adhesive_thickness?: number | undefined;
    } | {
        type: "pcb_panel";
        width: number;
        height: number;
        thickness: number;
        center: {
            x: number;
            y: number;
        };
        pcb_panel_id: string;
        covered_with_solder_mask: boolean;
    } | {
        type: "pcb_group";
        center: {
            x: number;
            y: number;
        };
        pcb_group_id: string;
        anchor_alignment: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right";
        pcb_component_ids: string[];
        source_group_id: string;
        description?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        name?: string | undefined;
        display_offset_x?: string | undefined;
        display_offset_y?: string | undefined;
        subcircuit_id?: string | undefined;
        position_mode?: "packed" | "relative_to_group_anchor" | "none" | undefined;
        anchor_position?: {
            x: number;
            y: number;
        } | undefined;
        positioned_relative_to_pcb_group_id?: string | undefined;
        positioned_relative_to_pcb_board_id?: string | undefined;
        is_subcircuit?: boolean | undefined;
        outline?: {
            x: number;
            y: number;
        }[] | undefined;
        child_layout_mode?: "packed" | "none" | undefined;
        layout_mode?: string | undefined;
        autorouter_configuration?: {
            trace_clearance: number;
        } | undefined;
        autorouter_used_string?: string | undefined;
    } | {
        type: "pcb_trace_hint";
        pcb_component_id: string;
        pcb_port_id: string;
        route: {
            x: number;
            y: number;
            via?: boolean | undefined;
            to_layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
            trace_width?: number | undefined;
        }[];
        pcb_trace_hint_id: string;
        subcircuit_id?: string | undefined;
    } | {
        type: "pcb_silkscreen_line";
        layer: "top" | "bottom";
        pcb_component_id: string;
        pcb_silkscreen_line_id: string;
        stroke_width: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_silkscreen_path";
        layer: "top" | "bottom";
        pcb_component_id: string;
        route: {
            x: number;
            y: number;
        }[];
        stroke_width: number;
        pcb_silkscreen_path_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_silkscreen_text";
        font: "tscircuit2024";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_component_id: string;
        anchor_position: {
            x: number;
            y: number;
        };
        anchor_alignment: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right";
        text: string;
        pcb_silkscreen_text_id: string;
        font_size: number;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_knockout?: boolean | undefined;
        knockout_padding?: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        } | undefined;
        is_mirrored?: boolean | undefined;
    } | {
        type: "pcb_silkscreen_pill";
        width: number;
        height: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        pcb_silkscreen_pill_id: string;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_copper_text";
        font: "tscircuit2024";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_component_id: string;
        anchor_position: {
            x: number;
            y: number;
        };
        anchor_alignment: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right";
        text: string;
        font_size: number;
        pcb_copper_text_id: string;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_knockout?: boolean | undefined;
        knockout_padding?: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        } | undefined;
        is_mirrored?: boolean | undefined;
    } | {
        type: "pcb_silkscreen_rect";
        width: number;
        height: number;
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        stroke_width: number;
        pcb_silkscreen_rect_id: string;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        corner_radius?: number | undefined;
        is_filled?: boolean | undefined;
        has_stroke?: boolean | undefined;
        is_stroke_dashed?: boolean | undefined;
    } | {
        type: "pcb_silkscreen_circle";
        radius: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        stroke_width: number;
        pcb_silkscreen_circle_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_filled?: boolean | undefined;
    } | {
        type: "pcb_silkscreen_oval";
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        pcb_silkscreen_oval_id: string;
        radius_x: number;
        radius_y: number;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_silkscreen_graphic";
        shape: "brep";
        layer: "top" | "bottom";
        pcb_component_id: string;
        pcb_silkscreen_graphic_id: string;
        brep_shape: {
            outer_ring: {
                vertices: {
                    x: number;
                    y: number;
                    bulge?: number | undefined;
                }[];
            };
            inner_rings: {
                vertices: {
                    x: number;
                    y: number;
                    bulge?: number | undefined;
                }[];
            }[];
        };
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        image_asset?: {
            project_relative_path: string;
            url: string;
            mimetype: string;
        } | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        actual_length_skew: number;
        maximum_length_skew: number;
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "length_skew";
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        actual_trace_length: number;
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "min_length";
        minimum_trace_length: number;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        actual_trace_length: number;
        maximum_trace_length: number;
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "max_length";
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        actual_trace_length: number;
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "target_length";
        target_trace_length: number;
        length_tolerance: number;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "pcb_trace_spacing";
        other_pcb_trace_id: string;
        actual_centerline_spacing: number;
        minimum_centerline_spacing: number;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        other_source_trace_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "pcb_spacing_to_other_signals";
        other_pcb_trace_id: string;
        actual_centerline_spacing: number;
        minimum_centerline_spacing: number;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        other_source_trace_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_error";
        error_type: "pcb_bus_routing_constraint_error";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        pcb_bus_routing_constraint_error_id: string;
        routing_rule: "impedance_target";
        target_impedance: number;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        minimum_impedance?: number | undefined;
        maximum_impedance?: number | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_warning";
        warning_type: "pcb_bus_routing_constraint_warning";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        routing_rule: "route_geometry";
        pcb_bus_routing_constraint_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_warning";
        warning_type: "pcb_bus_routing_constraint_warning";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        routing_rule: "reference_geometry";
        pcb_bus_routing_constraint_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_warning";
        warning_type: "pcb_bus_routing_constraint_warning";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        routing_rule: "spacing_geometry";
        pcb_bus_routing_constraint_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_warning";
        warning_type: "pcb_bus_routing_constraint_warning";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        routing_rule: "target_length";
        pcb_bus_routing_constraint_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_bus_routing_constraint_warning";
        warning_type: "pcb_bus_routing_constraint_warning";
        source_bus_id: string;
        source_trace_ids: string[];
        pcb_trace_ids: string[];
        routing_rule: "physical_impedance";
        pcb_bus_routing_constraint_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_trace_error";
        source_trace_id: string;
        pcb_trace_id: string;
        pcb_component_ids: string[];
        pcb_port_ids: string[];
        error_type: "pcb_trace_error";
        pcb_trace_error_id: string;
        center?: {
            x: number;
            y: number;
        } | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_trace_missing_error";
        source_trace_id: string;
        pcb_component_ids: string[];
        pcb_port_ids: string[];
        error_type: "pcb_trace_missing_error";
        pcb_trace_missing_error_id: string;
        center?: {
            x: number;
            y: number;
        } | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_placement_error";
        error_type: "pcb_placement_error";
        pcb_placement_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_packing_error";
        error_type: "pcb_packing_error";
        pcb_packing_error_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_panelization_placement_error";
        error_type: "pcb_panelization_placement_error";
        pcb_panelization_placement_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        pcb_board_id?: string | undefined;
        pcb_panel_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_port_not_matched_error";
        pcb_component_ids: string[];
        error_type: "pcb_port_not_matched_error";
        pcb_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_port_not_connected_error";
        pcb_component_ids: string[];
        pcb_port_ids: string[];
        error_type: "pcb_port_not_connected_error";
        pcb_port_not_connected_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_via_clearance_error";
        error_type: "pcb_via_clearance_error";
        pcb_error_id: string;
        pcb_via_ids: string[];
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        minimum_clearance?: number | undefined;
        actual_clearance?: number | undefined;
        pcb_center?: {
            x?: number | undefined;
            y?: number | undefined;
        } | undefined;
    } | {
        message: string;
        type: "pcb_via_trace_clearance_error";
        pcb_trace_id: string;
        error_type: "pcb_via_trace_clearance_error";
        pcb_via_id: string;
        pcb_via_trace_clearance_error_id: string;
        center?: {
            x?: number | undefined;
            y?: number | undefined;
        } | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        minimum_clearance?: number | undefined;
        actual_clearance?: number | undefined;
    } | {
        message: string;
        type: "pcb_pad_pad_clearance_error";
        error_type: "pcb_pad_pad_clearance_error";
        pcb_pad_pad_clearance_error_id: string;
        pcb_pad_ids: string[];
        center?: {
            x?: number | undefined;
            y?: number | undefined;
        } | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        minimum_clearance?: number | undefined;
        actual_clearance?: number | undefined;
    } | {
        message: string;
        type: "pcb_pad_trace_clearance_error";
        pcb_trace_id: string;
        error_type: "pcb_pad_trace_clearance_error";
        pcb_pad_trace_clearance_error_id: string;
        pcb_pad_id: string;
        center?: {
            x?: number | undefined;
            y?: number | undefined;
        } | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        minimum_clearance?: number | undefined;
        actual_clearance?: number | undefined;
    } | {
        type: "pcb_fabrication_note_path";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_component_id: string;
        route: {
            x: number;
            y: number;
        }[];
        stroke_width: number;
        pcb_fabrication_note_path_id: string;
        subcircuit_id?: string | undefined;
        is_filled?: boolean | undefined;
        has_stroke?: boolean | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_fabrication_note_text";
        font: "tscircuit2024";
        layer: "top" | "bottom";
        pcb_component_id: string;
        anchor_position: {
            x: number;
            y: number;
        };
        anchor_alignment: "top_left" | "top_right" | "center" | "bottom_left" | "bottom_right";
        text: string;
        font_size: number;
        pcb_fabrication_note_text_id: string;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_fabrication_note_rect";
        width: number;
        height: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        stroke_width: number;
        pcb_fabrication_note_rect_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        corner_radius?: number | undefined;
        is_filled?: boolean | undefined;
        has_stroke?: boolean | undefined;
        is_stroke_dashed?: boolean | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_fabrication_note_dimension";
        font: "tscircuit2024";
        layer: "top" | "bottom";
        pcb_component_id: string;
        font_size: number;
        pcb_fabrication_note_dimension_id: string;
        from: {
            x: number;
            y: number;
        };
        to: {
            x: number;
            y: number;
        };
        arrow_size: number;
        offset?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        text?: string | undefined;
        color?: string | undefined;
        text_ccw_rotation?: number | undefined;
        offset_distance?: number | undefined;
        offset_direction?: {
            x: number;
            y: number;
        } | undefined;
    } | {
        type: "pcb_note_text";
        font: "tscircuit2024";
        layer: "top" | "bottom";
        anchor_position: {
            x: number;
            y: number;
        };
        anchor_alignment: "top_left" | "top_right" | "center" | "bottom_left" | "bottom_right";
        font_size: number;
        pcb_note_text_id: string;
        name?: string | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        text?: string | undefined;
        color?: string | undefined;
        is_mirrored_from_top_view?: boolean | undefined;
    } | {
        type: "pcb_note_rect";
        width: number;
        height: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        stroke_width: number;
        pcb_note_rect_id: string;
        name?: string | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        corner_radius?: number | undefined;
        text?: string | undefined;
        is_filled?: boolean | undefined;
        has_stroke?: boolean | undefined;
        is_stroke_dashed?: boolean | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_note_path";
        layer: "top" | "bottom";
        route: {
            x: number;
            y: number;
        }[];
        stroke_width: number;
        pcb_note_path_id: string;
        name?: string | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        text?: string | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_note_line";
        layer: "top" | "bottom";
        stroke_width: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        pcb_note_line_id: string;
        name?: string | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        text?: string | undefined;
        color?: string | undefined;
        is_dashed?: boolean | undefined;
    } | {
        type: "pcb_note_dimension";
        font: "tscircuit2024";
        layer: "top" | "bottom";
        font_size: number;
        from: {
            x: number;
            y: number;
        };
        to: {
            x: number;
            y: number;
        };
        arrow_size: number;
        pcb_note_dimension_id: string;
        name?: string | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        text?: string | undefined;
        color?: string | undefined;
        text_ccw_rotation?: number | undefined;
        offset_distance?: number | undefined;
        offset_direction?: {
            x: number;
            y: number;
        } | undefined;
    } | {
        message: string;
        type: "pcb_autorouting_error";
        error_type: "pcb_autorouting_error";
        pcb_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_preflight_routing_error";
        error_type: "pcb_preflight_routing_error";
        pcb_preflight_routing_error_id: string;
        error_code: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_component_ids?: string[] | undefined;
        pcb_port_ids?: string[] | undefined;
        is_fatal?: boolean | undefined;
        source_trace_ids?: string[] | undefined;
        routing_phase_index?: number | undefined;
        phase_name?: string | undefined;
        related_error_ids?: string[] | undefined;
        measurements?: Record<string, number> | undefined;
    } | {
        message: string;
        type: "pcb_footprint_overlap_error";
        error_type: "pcb_footprint_overlap_error";
        pcb_error_id: string;
        is_fatal?: boolean | undefined;
        pcb_smtpad_ids?: string[] | undefined;
        pcb_plated_hole_ids?: string[] | undefined;
        pcb_hole_ids?: string[] | undefined;
        pcb_keepout_ids?: string[] | undefined;
    } | {
        message: string;
        type: "pcb_courtyard_overlap_error";
        pcb_component_ids: [string, string];
        error_type: "pcb_courtyard_overlap_error";
        pcb_error_id: string;
        is_fatal?: boolean | undefined;
    } | {
        type: "pcb_breakout_point";
        x: number;
        y: number;
        pcb_group_id: string;
        pcb_breakout_point_id: string;
        layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
        subcircuit_id?: string | undefined;
        source_port_id?: string | undefined;
        source_trace_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        type: "pcb_cutout";
        width: number;
        height: number;
        shape: "rect";
        center: {
            x: number;
            y: number;
        };
        pcb_cutout_id: string;
        rotation?: number | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        corner_radius?: number | undefined;
        pcb_board_id?: string | undefined;
        pcb_panel_id?: string | undefined;
    } | {
        type: "pcb_cutout";
        shape: "circle";
        radius: number;
        center: {
            x: number;
            y: number;
        };
        pcb_cutout_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_board_id?: string | undefined;
        pcb_panel_id?: string | undefined;
    } | {
        type: "pcb_cutout";
        shape: "polygon";
        points: {
            x: number;
            y: number;
        }[];
        pcb_cutout_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_board_id?: string | undefined;
        pcb_panel_id?: string | undefined;
    } | {
        type: "pcb_cutout";
        shape: "path";
        route: {
            x: number;
            y: number;
        }[];
        pcb_cutout_id: string;
        slot_width: number;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        pcb_board_id?: string | undefined;
        pcb_panel_id?: string | undefined;
        slot_length?: number | undefined;
        space_between_slots?: number | undefined;
        slot_corner_radius?: number | undefined;
    } | {
        type: "pcb_ground_plane";
        source_net_id: string;
        pcb_ground_plane_id: string;
        source_pcb_ground_plane_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_ground_plane_region";
        points: {
            x: number;
            y: number;
        }[];
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_ground_plane_id: string;
        pcb_ground_plane_region_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_thermal_spoke";
        shape: string;
        pcb_ground_plane_id: string;
        pcb_thermal_spoke_id: string;
        spoke_count: number;
        spoke_thickness: number;
        spoke_inner_diameter: number;
        spoke_outer_diameter: number;
        subcircuit_id?: string | undefined;
        pcb_plated_hole_id?: string | undefined;
    } | {
        type: "pcb_copper_pour";
        width: number;
        height: number;
        shape: "rect";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        center: {
            x: number;
            y: number;
        };
        covered_with_solder_mask: boolean;
        pcb_copper_pour_id: string;
        rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        type: "pcb_copper_pour";
        shape: "brep";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        covered_with_solder_mask: boolean;
        brep_shape: {
            outer_ring: {
                vertices: {
                    x: number;
                    y: number;
                    bulge?: number | undefined;
                }[];
            };
            inner_rings: {
                vertices: {
                    x: number;
                    y: number;
                    bulge?: number | undefined;
                }[];
            }[];
        };
        pcb_copper_pour_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        type: "pcb_copper_pour";
        shape: "polygon";
        points: {
            x: number;
            y: number;
        }[];
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        covered_with_solder_mask: boolean;
        pcb_copper_pour_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        source_net_id?: string | undefined;
    } | {
        message: string;
        type: "pcb_component_outside_board_error";
        pcb_component_id: string;
        error_type: "pcb_component_outside_board_error";
        pcb_board_id: string;
        pcb_component_outside_board_error_id: string;
        component_center: {
            x: number;
            y: number;
        };
        component_bounds: {
            min_x: number;
            max_x: number;
            min_y: number;
            max_y: number;
        };
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_component_not_on_board_edge_error";
        pcb_component_id: string;
        error_type: "pcb_component_not_on_board_edge_error";
        pcb_board_id: string;
        component_center: {
            x: number;
            y: number;
        };
        pcb_component_not_on_board_edge_error_id: string;
        pad_to_nearest_board_edge_distance: number;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "pcb_component_invalid_layer_error";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        source_component_id: string;
        error_type: "pcb_component_invalid_layer_error";
        pcb_component_invalid_layer_error_id: string;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        type: "pcb_courtyard_rect";
        width: number;
        height: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        pcb_courtyard_rect_id: string;
        ccw_rotation?: number | undefined;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_courtyard_outline";
        layer: "top" | "bottom";
        pcb_component_id: string;
        outline: {
            x: number;
            y: number;
        }[];
        pcb_courtyard_outline_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
    } | {
        type: "pcb_courtyard_polygon";
        points: {
            x: number;
            y: number;
        }[];
        layer: "top" | "bottom";
        pcb_component_id: string;
        pcb_courtyard_polygon_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_courtyard_circle";
        radius: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        pcb_courtyard_circle_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        color?: string | undefined;
    } | {
        type: "pcb_courtyard_pill";
        width: number;
        height: number;
        radius: number;
        layer: "top" | "bottom";
        center: {
            x: number;
            y: number;
        };
        pcb_component_id: string;
        pcb_courtyard_pill_id: string;
        subcircuit_id?: string | undefined;
        pcb_group_id?: string | undefined;
        color?: string | undefined;
    } | {
        type: "schematic_box";
        x: number;
        y: number;
        width: number;
        height: number;
        is_dashed: boolean;
        subcircuit_id?: string | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
    } | {
        type: "schematic_text";
        anchor: "top" | "bottom" | "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right" | "left" | "right";
        rotation: number;
        text: string;
        font_size: number;
        color: string;
        schematic_text_id: string;
        position: {
            x: number;
            y: number;
        };
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
        text_parts?: {
            text: string;
            is_overlined?: boolean | undefined;
        }[] | undefined;
        display_superscript?: string | undefined;
    } | {
        type: "schematic_line";
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        color: string;
        is_dashed: boolean;
        schematic_line_id: string;
        subcircuit_id?: string | undefined;
        stroke_width?: number | null | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
        dash_length?: number | undefined;
        dash_gap?: number | undefined;
    } | {
        type: "schematic_rect";
        width: number;
        height: number;
        rotation: number;
        center: {
            x: number;
            y: number;
        };
        is_filled: boolean;
        color: string;
        is_dashed: boolean;
        schematic_rect_id: string;
        subcircuit_id?: string | undefined;
        stroke_width?: number | null | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
        fill_color?: string | undefined;
    } | {
        type: "schematic_circle";
        radius: number;
        center: {
            x: number;
            y: number;
        };
        is_filled: boolean;
        color: string;
        is_dashed: boolean;
        schematic_circle_id: string;
        subcircuit_id?: string | undefined;
        stroke_width?: number | null | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
        fill_color?: string | undefined;
    } | {
        type: "schematic_arc";
        radius: number;
        center: {
            x: number;
            y: number;
        };
        color: string;
        is_dashed: boolean;
        direction: "clockwise" | "counterclockwise";
        schematic_arc_id: string;
        start_angle_degrees: number;
        end_angle_degrees: number;
        subcircuit_id?: string | undefined;
        stroke_width?: number | null | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
    } | {
        type: "schematic_component";
        size: {
            width: number;
            height: number;
        };
        center: {
            x: number;
            y: number;
        };
        schematic_component_id: string;
        is_box_with_pins: boolean;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        source_group_id?: string | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
        pin_spacing?: number | undefined;
        pin_styles?: Record<string, {
            left_margin?: number | undefined;
            right_margin?: number | undefined;
            top_margin?: number | undefined;
            bottom_margin?: number | undefined;
        }> | undefined;
        box_width?: number | undefined;
        symbol_name?: string | undefined;
        port_arrangement?: {
            left_size: number;
            right_size: number;
            top_size?: number | undefined;
            bottom_size?: number | undefined;
        } | {
            left_side?: {
                pins: number[];
                direction?: "top-to-bottom" | "bottom-to-top" | undefined;
            } | undefined;
            right_side?: {
                pins: number[];
                direction?: "top-to-bottom" | "bottom-to-top" | undefined;
            } | undefined;
            top_side?: {
                pins: number[];
                direction?: "left-to-right" | "right-to-left" | undefined;
            } | undefined;
            bottom_side?: {
                pins: number[];
                direction?: "left-to-right" | "right-to-left" | undefined;
            } | undefined;
        } | undefined;
        port_labels?: Record<string, string> | undefined;
        symbol_display_value?: string | undefined;
        schematic_group_id?: string | undefined;
        is_schematic_group?: boolean | undefined;
    } | {
        type: "schematic_symbol";
        schematic_symbol_id: string;
        name?: string | undefined;
        metadata?: zod.objectOutputType<{
            kicad_symbol: zod.ZodOptional<zod.ZodObject<{
                symbolName: zod.ZodOptional<zod.ZodString>;
                extends: zod.ZodOptional<zod.ZodString>;
                pinNumbers: zod.ZodOptional<zod.ZodObject<{
                    hide: zod.ZodOptional<zod.ZodBoolean>;
                }, "strip", zod.ZodTypeAny, {
                    hide?: boolean | undefined;
                }, {
                    hide?: boolean | undefined;
                }>>;
                pinNames: zod.ZodOptional<zod.ZodObject<{
                    offset: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                    hide: zod.ZodOptional<zod.ZodBoolean>;
                }, "strip", zod.ZodTypeAny, {
                    hide?: boolean | undefined;
                    offset?: number | undefined;
                }, {
                    hide?: boolean | undefined;
                    offset?: string | number | undefined;
                }>>;
                excludeFromSim: zod.ZodOptional<zod.ZodBoolean>;
                inBom: zod.ZodOptional<zod.ZodBoolean>;
                onBoard: zod.ZodOptional<zod.ZodBoolean>;
                properties: zod.ZodOptional<zod.ZodObject<{
                    Reference: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                    Value: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                    Footprint: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                    Datasheet: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                    Description: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                    ki_keywords: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                    ki_fp_filters: zod.ZodOptional<zod.ZodObject<{
                        value: zod.ZodString;
                        id: zod.ZodOptional<zod.ZodUnion<[zod.ZodNumber, zod.ZodString]>>;
                        at: zod.ZodOptional<zod.ZodObject<{
                            x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                            y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                        } & {
                            rotation: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                        }, "strip", zod.ZodTypeAny, {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        }, {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        }>>;
                        effects: zod.ZodOptional<zod.ZodObject<{
                            font: zod.ZodOptional<zod.ZodObject<{
                                size: zod.ZodOptional<zod.ZodObject<{
                                    x: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                    y: zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>;
                                }, "strip", zod.ZodTypeAny, {
                                    x: number;
                                    y: number;
                                }, {
                                    x: string | number;
                                    y: string | number;
                                }>>;
                                thickness: zod.ZodOptional<zod.ZodEffects<zod.ZodUnion<[zod.ZodString, zod.ZodNumber]>, number, string | number>>;
                            }, "strip", zod.ZodTypeAny, {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            }, {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            }>>;
                            justify: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
                            hide: zod.ZodOptional<zod.ZodBoolean>;
                        }, "strip", zod.ZodTypeAny, {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }, {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        }>>;
                    }, "strip", zod.ZodTypeAny, {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }, {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    }>>;
                }, "strip", zod.ZodTypeAny, {
                    Reference?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Value?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Datasheet?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Description?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Footprint?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_keywords?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_fp_filters?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                }, {
                    Reference?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Value?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Datasheet?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Description?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Footprint?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_keywords?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_fp_filters?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                }>>;
                embeddedFonts: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                properties?: {
                    Reference?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Value?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Datasheet?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Description?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Footprint?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_keywords?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_fp_filters?: {
                        value: string;
                        at?: {
                            x: number;
                            y: number;
                            rotation?: number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: number;
                                    y: number;
                                } | undefined;
                                thickness?: number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                } | undefined;
                embeddedFonts?: boolean | undefined;
                symbolName?: string | undefined;
                extends?: string | undefined;
                pinNumbers?: {
                    hide?: boolean | undefined;
                } | undefined;
                pinNames?: {
                    hide?: boolean | undefined;
                    offset?: number | undefined;
                } | undefined;
                excludeFromSim?: boolean | undefined;
                inBom?: boolean | undefined;
                onBoard?: boolean | undefined;
            }, {
                properties?: {
                    Reference?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Value?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Datasheet?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Description?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    Footprint?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_keywords?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                    ki_fp_filters?: {
                        value: string;
                        at?: {
                            x: string | number;
                            y: string | number;
                            rotation?: string | number | undefined;
                        } | undefined;
                        effects?: {
                            font?: {
                                size?: {
                                    x: string | number;
                                    y: string | number;
                                } | undefined;
                                thickness?: string | number | undefined;
                            } | undefined;
                            hide?: boolean | undefined;
                            justify?: string | string[] | undefined;
                        } | undefined;
                        id?: string | number | undefined;
                    } | undefined;
                } | undefined;
                embeddedFonts?: boolean | undefined;
                symbolName?: string | undefined;
                extends?: string | undefined;
                pinNumbers?: {
                    hide?: boolean | undefined;
                } | undefined;
                pinNames?: {
                    hide?: boolean | undefined;
                    offset?: string | number | undefined;
                } | undefined;
                excludeFromSim?: boolean | undefined;
                inBom?: boolean | undefined;
                onBoard?: boolean | undefined;
            }>>;
        }, zod.ZodUnknown, "strip"> | undefined;
    } | {
        type: "schematic_port";
        center: {
            x: number;
            y: number;
        };
        source_port_id: string;
        schematic_port_id: string;
        subcircuit_id?: string | undefined;
        facing_direction?: "left" | "right" | "up" | "down" | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        distance_from_component_edge?: number | undefined;
        side_of_component?: "top" | "bottom" | "left" | "right" | undefined;
        true_ccw_index?: number | undefined;
        pin_number?: number | undefined;
        display_pin_label?: string | undefined;
        display_pin_label_text_parts?: {
            text: string;
            is_overlined?: boolean | undefined;
        }[] | undefined;
        display_pin_label_font_size?: number | undefined;
        is_connected?: boolean | undefined;
        is_internal_circuit_port?: boolean | undefined;
        is_overlapping_internal_circuit_port?: boolean | undefined;
        has_input_arrow?: boolean | undefined;
        has_output_arrow?: boolean | undefined;
        is_drawn_with_inversion_circle?: boolean | undefined;
    } | {
        type: "schematic_trace";
        schematic_trace_id: string;
        junctions: {
            x: number;
            y: number;
        }[];
        edges: {
            from: {
                x: number;
                y: number;
            };
            to: {
                x: number;
                y: number;
            };
            is_crossing?: boolean | undefined;
            from_schematic_port_id?: string | undefined;
            to_schematic_port_id?: string | undefined;
        }[];
        subcircuit_id?: string | undefined;
        source_trace_id?: string | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        schematic_sheet_id?: string | undefined;
    } | {
        type: "schematic_path";
        points: {
            x: number;
            y: number;
        }[];
        is_dashed: boolean;
        schematic_path_id: string;
        subcircuit_id?: string | undefined;
        stroke_width?: number | null | undefined;
        is_filled?: boolean | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        schematic_symbol_id?: string | undefined;
        fill_color?: string | undefined;
        stroke_color?: string | undefined;
        dash_length?: number | undefined;
        dash_gap?: number | undefined;
    } | {
        message: string;
        type: "schematic_error";
        error_type: "schematic_port_not_found";
        schematic_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        message: string;
        type: "schematic_layout_error";
        error_type: "schematic_layout_error";
        source_group_id: string;
        schematic_group_id: string;
        schematic_layout_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
    } | {
        type: "schematic_net_label";
        center: {
            x: number;
            y: number;
        };
        text: string;
        source_net_id: string;
        schematic_net_label_id: string;
        anchor_side: "top" | "bottom" | "left" | "right";
        subcircuit_id?: string | undefined;
        anchor_position?: {
            x: number;
            y: number;
        } | undefined;
        source_trace_id?: string | undefined;
        schematic_sheet_id?: string | undefined;
        symbol_name?: string | undefined;
        schematic_trace_id?: string | undefined;
        display_superscript?: string | undefined;
        is_movable?: boolean | undefined;
    } | {
        type: "schematic_debug_object";
        shape: "rect";
        size: {
            width: number;
            height: number;
        };
        center: {
            x: number;
            y: number;
        };
        subcircuit_id?: string | undefined;
        label?: string | undefined;
    } | {
        type: "schematic_debug_object";
        shape: "line";
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
        subcircuit_id?: string | undefined;
        label?: string | undefined;
    } | {
        type: "schematic_debug_object";
        shape: "point";
        center: {
            x: number;
            y: number;
        };
        subcircuit_id?: string | undefined;
        label?: string | undefined;
    } | {
        type: "schematic_voltage_probe";
        schematic_trace_id: string;
        position: {
            x: number;
            y: number;
        };
        schematic_voltage_probe_id: string;
        name?: string | undefined;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        color?: string | undefined;
        schematic_sheet_id?: string | undefined;
        voltage?: number | undefined;
        label_alignment?: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right" | undefined;
    } | {
        message: string;
        type: "schematic_manual_edit_conflict_warning";
        source_component_id: string;
        warning_type: "schematic_manual_edit_conflict_warning";
        schematic_component_id: string;
        schematic_manual_edit_conflict_warning_id: string;
        subcircuit_id?: string | undefined;
        schematic_group_id?: string | undefined;
    } | {
        message: string;
        type: "schematic_component_overlap_warning";
        warning_type: "schematic_component_overlap_warning";
        schematic_component_overlap_warning_id: string;
        schematic_component_ids: [string, string];
        schematic_sheet_id?: string | undefined;
    } | {
        message: string;
        type: "schematic_component_styling_warning";
        warning_type: "schematic_component_styling_warning";
        styling_issue_type: string;
        schematic_component_id: string;
        schematic_component_styling_warning_id: string;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_port_ids?: string[] | undefined;
    } | {
        message: string;
        type: "schematic_sheet_styling_warning";
        warning_type: "schematic_sheet_styling_warning";
        styling_issue_type: "non_default_sheet_size";
        schematic_sheet_id: string;
        schematic_sheet_styling_warning_id: string;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "schematic_missing_sheet_warning";
        warning_type: "schematic_missing_sheet_warning";
        schematic_missing_sheet_warning_id: string;
    } | {
        message: string;
        type: "schematic_element_outside_sheet_warning";
        warning_type: "schematic_element_outside_sheet_warning";
        schematic_sheet_id: string;
        schematic_element_outside_sheet_warning_id: string;
        schematic_element_type: "schematic_component" | "schematic_trace" | "schematic_net_label";
        schematic_element_id: string;
    } | {
        type: "schematic_graphic";
        schematic_graphic_id: string;
        width?: number | undefined;
        height?: number | undefined;
        schematic_sheet_id?: string | undefined;
        asset?: {
            project_relative_path: string;
            url: string;
            mimetype: string;
        } | undefined;
        svg_content?: string | undefined;
    } | {
        type: "schematic_group";
        width: number;
        height: number;
        center: {
            x: number;
            y: number;
        };
        source_group_id: string;
        schematic_group_id: string;
        schematic_component_ids: string[];
        description?: string | undefined;
        name?: string | undefined;
        subcircuit_id?: string | undefined;
        is_subcircuit?: boolean | undefined;
        schematic_sheet_id?: string | undefined;
        show_as_schematic_box?: boolean | undefined;
    } | {
        type: "schematic_sheet";
        schematic_sheet_id: string;
        name?: string | undefined;
        subcircuit_id?: string | undefined;
        sheet_index?: number | undefined;
        sheet_size?: "a4" | "ansi_b" | undefined;
        sheet_width?: number | undefined;
        sheet_height?: number | undefined;
        outline_color?: string | undefined;
    } | {
        type: "schematic_table";
        anchor_position: {
            x: number;
            y: number;
        };
        schematic_table_id: string;
        column_widths: number[];
        row_heights: number[];
        anchor?: "top_left" | "top_center" | "top_right" | "center_left" | "center" | "center_right" | "bottom_left" | "bottom_center" | "bottom_right" | undefined;
        subcircuit_id?: string | undefined;
        schematic_sheet_id?: string | undefined;
        schematic_component_id?: string | undefined;
        cell_padding?: number | undefined;
        border_width?: number | undefined;
    } | {
        type: "schematic_table_cell";
        width: number;
        height: number;
        center: {
            x: number;
            y: number;
        };
        schematic_table_id: string;
        schematic_table_cell_id: string;
        start_row_index: number;
        end_row_index: number;
        start_column_index: number;
        end_column_index: number;
        subcircuit_id?: string | undefined;
        text?: string | undefined;
        font_size?: number | undefined;
        schematic_sheet_id?: string | undefined;
        horizontal_align?: "center" | "left" | "right" | undefined;
        vertical_align?: "top" | "bottom" | "middle" | undefined;
    } | {
        type: "cad_component";
        source_component_id: string;
        anchor_alignment: "center" | "center_of_component_on_board_surface";
        position: {
            x: number;
            y: number;
            z: number;
        };
        cad_component_id: string;
        model_object_fit: "contain_within_bounds" | "fill_bounds";
        rotation?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        size?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        layer?: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8" | undefined;
        pcb_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        color?: string | undefined;
        footprinter_string?: string | undefined;
        is_on_folded_board?: boolean | undefined;
        model_obj_url?: string | undefined;
        model_stl_url?: string | undefined;
        model_3mf_url?: string | undefined;
        model_gltf_url?: string | undefined;
        model_glb_url?: string | undefined;
        model_step_url?: string | undefined;
        model_wrl_url?: string | undefined;
        model_asset?: {
            project_relative_path: string;
            url: string;
            mimetype: string;
        } | undefined;
        model_unit_to_mm_scale_factor?: number | undefined;
        model_board_normal_direction?: "x-" | "x+" | "y+" | "y-" | "z+" | "z-" | undefined;
        model_origin_position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        model_origin_alignment?: "unknown" | "center" | "center_of_component_on_board_surface" | "bottom_center_of_component" | undefined;
        model_jscad?: any;
        show_as_translucent_model?: boolean | undefined;
        show_as_bounding_box?: boolean | undefined;
        show_hidden_edges?: boolean | undefined;
    } | {
        path: {
            x: number;
            y: number;
            z: number;
        }[];
        type: "cad_cable";
        name: string;
        cad_cable_id: string;
        from_source_component_id: string;
        to_source_component_id: string;
        cableprinter_string: string;
        from_connector_pin1_position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        to_connector_pin1_position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
    } | {
        type: "cad_reference_surface";
        shape: "rect";
        name: string;
        center: {
            x: number;
            y: number;
            z: number;
        };
        source_component_id: string;
        cad_reference_surface_id: string;
        normal: {
            x: number;
            y: number;
            z: number;
        };
        x_axis: {
            x: number;
            y: number;
            z: number;
        };
        width?: number | undefined;
        height?: number | undefined;
        subcircuit_id?: string | undefined;
    } | {
        message: string;
        type: "cad_collision_error";
        error_type: "cad_collision_error";
        source_component_ids: string[];
        cad_collision_error_id: string;
        cad_component_ids: string[];
        intersection_area_mm2: number;
        threshold_area_mm2: number;
        pcb_component_ids?: string[] | undefined;
        is_fatal?: boolean | undefined;
    } | {
        type: "simulation_voltage_source";
        voltage: number;
        simulation_voltage_source_id: string;
        is_dc_source: true;
        positive_source_port_id?: string | undefined;
        negative_source_port_id?: string | undefined;
        positive_source_net_id?: string | undefined;
        negative_source_net_id?: string | undefined;
        ac_magnitude?: number | undefined;
        ac_phase?: number | undefined;
    } | {
        type: "simulation_voltage_source";
        simulation_voltage_source_id: string;
        is_dc_source: false;
        voltage?: number | undefined;
        ac_magnitude?: number | undefined;
        ac_phase?: number | undefined;
        terminal1_source_port_id?: string | undefined;
        terminal2_source_port_id?: string | undefined;
        terminal1_source_net_id?: string | undefined;
        terminal2_source_net_id?: string | undefined;
        frequency?: number | undefined;
        peak_to_peak_voltage?: number | undefined;
        wave_shape?: "square" | "sinewave" | "triangle" | "sawtooth" | undefined;
        phase?: number | undefined;
        duty_cycle?: number | undefined;
        pulse_delay?: number | undefined;
        rise_time?: number | undefined;
        fall_time?: number | undefined;
        pulse_width?: number | undefined;
        period?: number | undefined;
    } | {
        type: "simulation_current_source";
        is_dc_source: true;
        simulation_current_source_id: string;
        current: number;
        positive_source_port_id?: string | undefined;
        negative_source_port_id?: string | undefined;
        positive_source_net_id?: string | undefined;
        negative_source_net_id?: string | undefined;
        ac_magnitude?: number | undefined;
        ac_phase?: number | undefined;
    } | {
        type: "simulation_current_source";
        is_dc_source: false;
        simulation_current_source_id: string;
        ac_magnitude?: number | undefined;
        ac_phase?: number | undefined;
        terminal1_source_port_id?: string | undefined;
        terminal2_source_port_id?: string | undefined;
        terminal1_source_net_id?: string | undefined;
        terminal2_source_net_id?: string | undefined;
        frequency?: number | undefined;
        wave_shape?: "square" | "sinewave" | "triangle" | "sawtooth" | undefined;
        phase?: number | undefined;
        duty_cycle?: number | undefined;
        current?: number | undefined;
        peak_to_peak_current?: number | undefined;
    } | {
        type: "simulation_experiment";
        name: string;
        simulation_experiment_id: string;
        experiment_type: "spice_dc_sweep" | "spice_dc_operating_point" | "spice_transient_analysis" | "spice_ac_analysis" | "pcb_return_current";
        time_per_step?: number | undefined;
        start_time_ms?: number | undefined;
        end_time_ms?: number | undefined;
        spice_options?: {
            method?: "trap" | "gear" | undefined;
            reltol?: string | number | undefined;
            abstol?: string | number | undefined;
            vntol?: string | number | undefined;
        } | undefined;
        dc_sweep_voltage_source_id?: string | undefined;
        dc_sweep_current_source_id?: string | undefined;
        dc_sweep_start?: number | undefined;
        dc_sweep_stop?: number | undefined;
        dc_sweep_step?: number | undefined;
        dc_sweep_unit?: circuit_json.SimulationDcSweepUnit | undefined;
        ac_sweep_type?: "linear" | "decade" | "octave" | undefined;
        ac_samples_per_interval?: number | undefined;
        ac_sample_count?: number | undefined;
        ac_start_frequency_hz?: number | undefined;
        ac_stop_frequency_hz?: number | undefined;
    } | {
        type: "simulation_return_current_excitation";
        pcb_trace_id: string;
        current: number;
        simulation_experiment_id: string;
        simulation_return_current_excitation_id: string;
        ground_source_net_id: string;
        return_source: {
            x: number;
            y: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_port_id: string;
            contact_type: "pcb_port";
        } | {
            x: number;
            y: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_via_id: string;
            contact_type: "pcb_via";
        } | {
            x: number;
            y: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_copper_pour_id: string;
            contact_type: "pcb_copper_pour";
        };
        return_sink: {
            x: number;
            y: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_port_id: string;
            contact_type: "pcb_port";
        } | {
            x: number;
            y: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_via_id: string;
            contact_type: "pcb_via";
        } | {
            x: number;
            y: number;
            layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            pcb_copper_pour_id: string;
            contact_type: "pcb_copper_pour";
        };
        source_port?: {
            resistance: number;
            signal_pcb_port_id: string;
            reference_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            reference_pcb_port_id?: string | undefined;
        } | undefined;
        load_port?: {
            resistance: number;
            signal_pcb_port_id: string;
            reference_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
            reference_pcb_port_id?: string | undefined;
        } | undefined;
    } | {
        type: "simulation_pcb_return_current_result";
        pcb_board_id: string;
        simulation_experiment_id: string;
        simulation_pcb_return_current_result_id: string;
        simulation_return_current_excitation_ids: string[];
        frequency_hz?: number | undefined;
    } | {
        type: "simulation_pcb_return_current_field";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        source_net_id: string;
        min_x: number;
        min_y: number;
        simulation_pcb_return_current_result_id: string;
        simulation_pcb_return_current_field_id: string;
        field_type: "real" | "complex_phasor";
        columns: number;
        rows: number;
        cell_width: number;
        cell_height: number;
        copper_thickness: number;
        data_format: "simulation_return_current_grid_json_v1";
        field_asset: {
            project_relative_path: string;
            url: string;
            mimetype: string;
        };
    } | {
        type: "simulation_pcb_return_current_heatmap";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        source_net_id: string;
        image_asset: {
            project_relative_path: string;
            url: string;
            mimetype: string;
        };
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
        simulation_pcb_return_current_result_id: string;
        simulation_pcb_return_current_heatmap_id: string;
    } | {
        type: "simulation_pcb_return_current_marker";
        layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_port_id: string;
        simulation_pcb_return_current_result_id: string;
        simulation_pcb_return_current_marker_id: string;
        role: "return_source" | "return_sink" | "signal_source" | "signal_load" | "signal_transition" | "return_transition";
        target_type: "pcb_port";
        label?: string | undefined;
        label_x?: number | undefined;
        label_y?: number | undefined;
    } | {
        type: "simulation_pcb_return_current_marker";
        to_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        from_layer: "top" | "bottom" | "inner1" | "inner2" | "inner3" | "inner4" | "inner5" | "inner6" | "inner7" | "inner8";
        pcb_via_id: string;
        simulation_pcb_return_current_result_id: string;
        simulation_pcb_return_current_marker_id: string;
        role: "return_source" | "return_sink" | "signal_source" | "signal_load" | "signal_transition" | "return_transition";
        target_type: "pcb_via";
        label?: string | undefined;
        label_x?: number | undefined;
        label_y?: number | undefined;
    } | {
        type: "simulation_transient_voltage_graph";
        simulation_experiment_id: string;
        time_per_step: number;
        start_time_ms: number;
        end_time_ms: number;
        simulation_transient_voltage_graph_id: string;
        voltage_levels: number[];
        name?: string | undefined;
        source_component_id?: string | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
        timestamps_ms?: number[] | undefined;
    } | {
        type: "simulation_transient_current_graph";
        simulation_experiment_id: string;
        time_per_step: number;
        start_time_ms: number;
        end_time_ms: number;
        simulation_transient_current_graph_id: string;
        current_levels: number[];
        name?: string | undefined;
        source_component_id?: string | undefined;
        subcircuit_connectivity_map_key?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
        timestamps_ms?: number[] | undefined;
    } | {
        type: "simulation_dc_operating_point_voltage";
        voltage: number;
        simulation_experiment_id: string;
        simulation_voltage_probe_id: string;
        simulation_dc_operating_point_voltage_id: string;
        name?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
    } | {
        type: "simulation_dc_operating_point_current";
        current: number;
        simulation_experiment_id: string;
        simulation_current_probe_id: string;
        simulation_dc_operating_point_current_id: string;
        name?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
    } | {
        type: "simulation_dc_sweep_voltage_graph";
        simulation_experiment_id: string;
        voltage_levels: number[];
        simulation_voltage_probe_id: string;
        simulation_dc_sweep_voltage_graph_id: string;
        sweep_values: number[];
        sweep_unit: circuit_json.SimulationDcSweepUnit;
        name?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
    } | {
        type: "simulation_dc_sweep_current_graph";
        simulation_experiment_id: string;
        current_levels: number[];
        simulation_current_probe_id: string;
        sweep_values: number[];
        sweep_unit: circuit_json.SimulationDcSweepUnit;
        simulation_dc_sweep_current_graph_id: string;
        name?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
    } | {
        type: "simulation_ac_sweep_voltage_graph";
        simulation_experiment_id: string;
        simulation_voltage_probe_id: string;
        simulation_ac_sweep_voltage_graph_id: string;
        frequencies_hz: number[];
        complex_voltages: {
            re: number;
            im: number;
        }[];
        name?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
    } | {
        type: "simulation_ac_sweep_current_graph";
        simulation_experiment_id: string;
        simulation_current_probe_id: string;
        frequencies_hz: number[];
        simulation_ac_sweep_current_graph_id: string;
        complex_currents: {
            re: number;
            im: number;
        }[];
        name?: string | undefined;
        color?: string | undefined;
        simulation_parameter_sweep_coordinate?: {
            simulation_parameter_sweep_id: string;
            sweep_index: number;
            parameter_value: number;
            parameter_unit: circuit_json.SimulationParameterUnit;
        } | undefined;
    } | {
        type: "simulation_parameter_sweep";
        simulation_experiment_id: string;
        simulation_parameter_sweep_id: string;
        parameter_unit: circuit_json.SimulationParameterUnit;
        parameter_values: number[];
        parameter_type: "resistance";
        resistor_source_component_id: string;
        name?: string | undefined;
    } | {
        type: "simulation_parameter_sweep";
        simulation_experiment_id: string;
        simulation_parameter_sweep_id: string;
        parameter_unit: circuit_json.SimulationParameterUnit;
        parameter_values: number[];
        parameter_type: "capacitance";
        capacitor_source_component_id: string;
        name?: string | undefined;
    } | {
        type: "simulation_parameter_sweep";
        simulation_experiment_id: string;
        simulation_parameter_sweep_id: string;
        parameter_unit: circuit_json.SimulationParameterUnit;
        parameter_values: number[];
        parameter_type: "inductance";
        inductor_source_component_id: string;
        name?: string | undefined;
    } | {
        type: "simulation_parameter_sweep";
        source_net_id: string;
        simulation_experiment_id: string;
        simulation_parameter_sweep_id: string;
        parameter_unit: circuit_json.SimulationParameterUnit;
        parameter_values: number[];
        parameter_type: "voltage";
        name?: string | undefined;
    } | {
        type: "simulation_parameter_sweep";
        simulation_experiment_id: string;
        simulation_parameter_sweep_id: string;
        parameter_unit: circuit_json.SimulationParameterUnit;
        parameter_values: number[];
        parameter_type: "current";
        current_source_component_id: string;
        name?: string | undefined;
    } | {
        type: "simulation_switch";
        simulation_switch_id: string;
        source_component_id?: string | undefined;
        closes_at?: number | undefined;
        opens_at?: number | undefined;
        starts_closed?: boolean | undefined;
        switching_frequency?: number | undefined;
    } | {
        type: "simulation_voltage_probe";
        simulation_voltage_probe_id: string;
        name?: string | undefined;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        color?: string | undefined;
        signal_input_source_port_id?: string | undefined;
        signal_input_source_net_id?: string | undefined;
        reference_input_source_port_id?: string | undefined;
        reference_input_source_net_id?: string | undefined;
    } | {
        type: "simulation_current_probe";
        simulation_current_probe_id: string;
        name?: string | undefined;
        source_component_id?: string | undefined;
        subcircuit_id?: string | undefined;
        color?: string | undefined;
        positive_source_port_id?: string | undefined;
        negative_source_port_id?: string | undefined;
        positive_source_net_id?: string | undefined;
        negative_source_net_id?: string | undefined;
    } | {
        type: "simulation_oscilloscope_trace";
        simulation_oscilloscope_trace_id: string;
        color?: string | undefined;
        simulation_transient_voltage_graph_id?: string | undefined;
        simulation_transient_current_graph_id?: string | undefined;
        simulation_voltage_probe_id?: string | undefined;
        simulation_current_probe_id?: string | undefined;
        display_name?: string | undefined;
        display_center_value?: number | undefined;
        display_center_offset_divs?: number | undefined;
        volts_per_div?: number | undefined;
        amps_per_div?: number | undefined;
    } | {
        message: string;
        type: "simulation_unknown_experiment_error";
        error_type: "simulation_unknown_experiment_error";
        simulation_unknown_experiment_error_id: string;
        subcircuit_id?: string | undefined;
        is_fatal?: boolean | undefined;
        simulation_experiment_id?: string | undefined;
    } | {
        type: "simulation_op_amp";
        simulation_op_amp_id: string;
        inverting_input_source_port_id: string;
        non_inverting_input_source_port_id: string;
        output_source_port_id: string;
        positive_supply_source_port_id: string;
        negative_supply_source_port_id: string;
        source_component_id?: string | undefined;
    } | {
        type: "simulation_spice_subcircuit";
        source_component_id: string;
        simulation_spice_subcircuit_id: string;
        spice_pin_to_source_port_map: Record<string, string>;
        subcircuit_source: string;
    })[] | undefined>;
}

declare const cache: Map<string, any>;

declare const getFetchWithEasyEdaProxy: ({ platformFetch: upstreamFetch, easyEdaProxyConfig, }: {
    platformFetch: PlatformFetch;
    easyEdaProxyConfig: EasyEdaProxyConfig;
}) => PlatformFetch;

declare const jlcPartsEngine: JlcPcbPartsEngine;

type DigiKeyPartsEngineOptions = {
    platformFetch?: PlatformFetch;
    apiBaseUrl?: string;
};
type DigiKeySearchPart = {
    digikey_product_number: string;
    supplier_part_number?: string;
    mfr: string;
    manufacturer?: string;
    package?: string;
    description?: string;
    stock: number;
    price?: number;
    normally_stocking?: boolean;
};

declare class DigiKeyPartsEngine implements PartsEngine {
    private readonly platformFetch;
    private readonly apiBaseUrl;
    constructor(options?: DigiKeyPartsEngineOptions);
    private getCategoryParts;
    private getKeywordParts;
    private toSupplierPartNumbers;
    findPart({ sourceComponent, footprinterString, }: Parameters<PartsEngine["findPart"]>[0]): Promise<{}>;
}

declare const digikeyCache: Map<string, unknown>;
declare const getDigiKeyPartsCached: (path: string, params: Record<string, string | number | boolean | undefined>, options?: {
    platformFetch?: PlatformFetch;
    apiBaseUrl?: string;
}) => Promise<Record<string, DigiKeySearchPart[]>>;
declare const withDigiKeyStockPreference: (parts: DigiKeySearchPart[] | undefined) => DigiKeySearchPart[];

declare const digikeyPartsEngine: DigiKeyPartsEngine;

type MouserPartsEngineOptions = {
    platformFetch?: PlatformFetch;
    apiBaseUrl?: string;
};
type MouserSearchPart = {
    mouser_product_number: string;
    supplier_part_number?: string;
    mfr: string;
    manufacturer?: string;
    package?: string;
    description?: string;
    stock: number;
    price?: number;
    normally_stocking?: boolean;
};

declare class MouserPartsEngine implements PartsEngine {
    private readonly platformFetch;
    private readonly apiBaseUrl;
    constructor(options?: MouserPartsEngineOptions);
    private getCategoryParts;
    private getKeywordParts;
    private toSupplierPartNumbers;
    findPart({ sourceComponent, footprinterString, }: Parameters<PartsEngine["findPart"]>[0]): Promise<{}>;
}

declare const mouserCache: Map<string, unknown>;
declare const getMouserPartsCached: (path: string, params: Record<string, string | number | boolean | undefined>, options?: {
    platformFetch?: PlatformFetch;
    apiBaseUrl?: string;
}) => Promise<Record<string, MouserSearchPart[]>>;
declare const withMouserStockPreference: (parts: MouserSearchPart[] | undefined) => MouserSearchPart[];

declare const mouserPartsEngine: MouserPartsEngine;

/** Supplier-independent electrical metadata; attributes use Circuit JSON fields. */
type DatasheetInformation = {
    datasheetId: string;
    chipName: string;
    circuitJson: AnyCircuitElement[];
    datasheetPdfUrls?: string[] | null;
    footprinterString?: string | null;
    /** Source text only. Never evaluated by the parts engine. */
    generatedTsx?: string | null;
};
type DatasheetInformationOptions = {
    /** Registry endpoint; independent of supplier URLs and EasyEDA proxies. */
    datasheetApiBaseUrl?: string;
    platformFetch?: PlatformFetch;
};
type FetchDatasheetInformationParams = {
    manufacturerPartNumber: string;
    platformFetch?: PlatformFetch;
};
type FetchDatasheetInformation = (params: FetchDatasheetInformationParams) => Promise<DatasheetInformation | undefined>;

/** Per-engine, per-fetch cache: bounded storage and shared concurrent requests. */
declare const createDatasheetInformationLoader: (options?: DatasheetInformationOptions) => ({ manufacturerPartNumber, platformFetch, }: FetchDatasheetInformationParams) => Promise<DatasheetInformation | undefined>;
/** Default registry provider, reusable without any supplier engine. */
declare const fetchDatasheetInformation: ({ manufacturerPartNumber, platformFetch, }: FetchDatasheetInformationParams) => Promise<DatasheetInformation | undefined>;

type DatasheetReconciliation = {
    circuitJson: AnyCircuitElement[];
    matchedSourcePortIds: string[];
    unmatchedSourcePortIds: string[];
    /** Matching a pin identity does not imply it has electrical attributes. */
    missingAttributeSourcePortIds: string[];
    unmatchedDatasheetSourcePortIds: string[];
    ambiguousMatches: {
        sourcePortId: string;
        datasheetSourcePortIds: string[];
    }[];
};
/** Reconcile electrical facts and internal connections without changing footprint geometry or IDs. */
declare const reconcileDatasheetCircuitJson: ({ circuitJson, datasheetCircuitJson, sourceComponentId, attributePriority, }: {
    circuitJson: AnyCircuitElement[];
    datasheetCircuitJson: AnyCircuitElement[];
    /** Required when the target circuit contains more than one component. */
    sourceComponentId?: string;
    /** Core can preserve explicit user attributes while filling absent fields. */
    attributePriority?: "datasheet" | "existing";
}) => DatasheetReconciliation;

export { type DatasheetInformation, type DatasheetInformationOptions, type DatasheetReconciliation, DigiKeyPartsEngine, type DigiKeyPartsEngineOptions, type DigiKeySearchPart, type EasyEdaProxyConfig, type FetchDatasheetInformation, type FetchDatasheetInformationParams, type FetchPartCircuitJsonParams, JlcPcbPartsEngine, type JlcPcbPartsEngineOptions, MouserPartsEngine, type MouserPartsEngineOptions, type MouserSearchPart, type PlatformFetch, cache, createDatasheetInformationLoader, digikeyCache, digikeyPartsEngine, fetchDatasheetInformation, getDigiKeyPartsCached, getFetchWithEasyEdaProxy, getMouserPartsCached, jlcPartsEngine, mouserCache, mouserPartsEngine, reconcileDatasheetCircuitJson, withDigiKeyStockPreference, withMouserStockPreference };
