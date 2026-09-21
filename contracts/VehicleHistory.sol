// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VehicleHistory {

    // ─── DATA STRUCTURES ─────────────────────────────────────────────

    struct Vehicle {
        string vin;
        string make;
        string model;
        uint256 year;
        string color;
        string initialMileage;
        address registeredBy;
        uint256 registeredAt;
        bool exists;
    }

    struct Record {
        uint256 timestamp;
        string recordType;
        string description;
        string mileage;
        string partDetails;
        address addedBy;
        string organizationName;
    }

    // ─── STATE VARIABLES ──────────────────────────────────────────────

    address public owner;
    mapping(address => bool) public admins;
    mapping(address => string) public adminNames;
    mapping(string => Vehicle) public vehicles;
    mapping(string => Record[]) private vehicleRecords;
    string[] public allVINs;

    // ─── EVENTS ───────────────────────────────────────────────────────

    event VehicleRegistered(string vin, string make, string model, address registeredBy);
    event RecordAdded(string vin, string recordType, address addedBy);
    event AdminAdded(address admin, string organizationName);
    event AdminRemoved(address admin);

    // ─── MODIFIERS ────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can do this");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not an authorized admin");
        _;
    }

    // ─── CONSTRUCTOR ─────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
        adminNames[msg.sender] = "System Owner";
    }

    // ─── ADMIN MANAGEMENT ────────────────────────────────────────────

    function addAdmin(address _admin, string memory _organizationName) public onlyOwner {
        admins[_admin] = true;
        adminNames[_admin] = _organizationName;
        emit AdminAdded(_admin, _organizationName);
    }

    function removeAdmin(address _admin) public onlyOwner {
        require(_admin != owner, "Cannot remove owner");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function isAdmin(address _address) public view returns (bool) {
        return admins[_address];
    }

    function getAdminName(address _address) public view returns (string memory) {
        return adminNames[_address];
    }

    // ─── VEHICLE MANAGEMENT ──────────────────────────────────────────

    function registerVehicle(
        string memory _vin,
        string memory _make,
        string memory _model,
        uint256 _year,
        string memory _color,
        string memory _initialMileage
    ) public onlyAdmin {
        require(!vehicles[_vin].exists, "Vehicle already registered");
        require(bytes(_vin).length == 17, "VIN must be 17 characters");

        vehicles[_vin] = Vehicle(
            _vin, _make, _model, _year, _color, _initialMileage,
            msg.sender, block.timestamp, true
        );
        allVINs.push(_vin);

        emit VehicleRegistered(_vin, _make, _model, msg.sender);
    }

    function addRecord(
        string memory _vin,
        string memory _recordType,
        string memory _description,
        string memory _mileage,
        string memory _partDetails
    ) public onlyAdmin {
        require(vehicles[_vin].exists, "Vehicle not found");

        vehicleRecords[_vin].push(Record(
            block.timestamp,
            _recordType,
            _description,
            _mileage,
            _partDetails,
            msg.sender,
            adminNames[msg.sender]
        ));

        emit RecordAdded(_vin, _recordType, msg.sender);
    }

    // ─── READ FUNCTIONS (public) ──────────────────────────────────────

    function getVehicle(string memory _vin) public view returns (Vehicle memory) {
        return vehicles[_vin];
    }

    function getRecords(string memory _vin) public view returns (Record[] memory) {
        return vehicleRecords[_vin];
    }

    function getRecordCount(string memory _vin) public view returns (uint256) {
        return vehicleRecords[_vin].length;
    }

    function getTotalVehicles() public view returns (uint256) {
        return allVINs.length;
    }

    function getTotalRecords() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < allVINs.length; i++) {
            total += vehicleRecords[allVINs[i]].length;
        }
        return total;
    }

    function vehicleExists(string memory _vin) public view returns (bool) {
        return vehicles[_vin].exists;
    }

    function getAllVINs() public view returns (string[] memory) {
        return allVINs;
    }
}
