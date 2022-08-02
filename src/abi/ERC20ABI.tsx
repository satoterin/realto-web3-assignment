
export const ERC20ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",
    "function approve(address _spender, uint256 _value) returns (bool)",
    "function allowance(address _owner, address _spender) view returns (uint256)",
    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
];
