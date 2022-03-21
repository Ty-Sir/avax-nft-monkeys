// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Monkeys is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    ERC721Burnable,
    ERC721Pausable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    using Address for address payable;
    using Strings for uint256;

    Counters.Counter private _tokenIdTracker;

    string private URIBASE;
    string private URIEXTENSION;
    uint256 public constant aMONKEYS = 222;
    uint256 public PRICE;
    address private devAddress;

    event MonkeyMinted(address minter, uint256 id, string URI);

    constructor(
        uint256 mintPrice,
        string memory _uriBase,
        string memory _uriExt
    ) ERC721("Avax Monkeys", "aMONKEYS") {
        setURIBase(_uriBase);
        setURIExt(_uriExt);
        setPrice(mintPrice);
        pause(true);
    }

    modifier saleIsOpen() {
        require(_totalSupply() <= aMONKEYS, "All Minted");
        if (_msgSender() != owner()) {
            require(!paused(), "Paused");
        }
        _;
    }

    function setDevAddress(address _devAddress) public onlyOwner {
        devAddress = _devAddress;
    }

    function setURIBase(string memory _uriBase) public onlyOwner {
        URIBASE = _uriBase;
    }

    function setURIExt(string memory _uriExt) public onlyOwner {
        URIEXTENSION = _uriExt;
    }

    function setPrice(uint256 _newPrice) public onlyOwner {
        PRICE = _newPrice;
    }

    function getPrice() public view returns (uint256) {
        return PRICE;
    }

    function _totalSupply() internal view returns (uint256) {
        return _tokenIdTracker.current();
    }

    function totalMinted() public view returns (uint256) {
        return _totalSupply();
    }

    // @dev concats the token id to link to metadata url i.e. https://somehost.com/metadata/ + {tokenId} + .json
    function _concatenateIdAndURI(uint256 _id)
        internal
        view
        returns (string memory)
    {
        string memory ID = Strings.toString(_id);

        return string(abi.encodePacked(URIBASE, ID, URIEXTENSION));
    }

    function mint(uint256 amount) public payable saleIsOpen {
        require(amount <= 100 && amount >= 1, "Amount to mint must be 1-100");
        require(
            amount <= _totalSupply() + amount,
            "Mint a lower number, not enough left to mint that many."
        );
        require(msg.value == PRICE * amount, "Incorrect price");

        address _to = msg.sender;
        uint256 tokenId;
        for (uint256 i = 0; i < amount; i++) {
            _tokenIdTracker.increment();

            tokenId = _tokenIdTracker.current();

            string memory URI = _concatenateIdAndURI(tokenId);

            _safeMint(_to, tokenId);

            _setTokenURI(tokenId, URI);

            emit MonkeyMinted(_to, tokenId, URI);
        }
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function walletOfOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(owner);

        uint256[] memory tokensId = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokensId;
    }

    function withdrawMonkeyBusiness() public payable nonReentrant {
        require(msg.sender == devAddress, "Only the dev can withdraw");
        require(address(this).balance != 0, "Nothing to withdraw");
        uint256 balance = address(this).balance;

        payable(devAddress).sendValue(balance);
    }

    function pause(bool val) public onlyOwner {
        if (val == true) {
            _pause();
            return;
        }
        _unpause();
    }

    function emergencyChangeDevAddress(address newDevAddress) public onlyOwner {
        devAddress = newDevAddress;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
