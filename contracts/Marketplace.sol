// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    using Address for address payable;

    address payable publisherWallet;
    uint256 public PUBLISHERFEE;

    struct Offer {
        address payable seller;
        address tokenAddress;
        uint256 price;
        uint256 offerId;
        uint256 tokenId;
        bool isSold;
        bool isActive;
    }

    Offer[] public offers;

    mapping(address => mapping(uint256 => bool)) activeOffers;

    mapping(address => mapping(uint256 => Offer)) tokenOffer;

    event monkeyAdded(
        address tokenAddress,
        address seller,
        uint256 price,
        uint256 tokenId,
        uint256 offerId,
        bool isSold
    );
    event monkeySold(
        address tokenAddress,
        address buyer,
        uint256 price,
        uint256 tokenId,
        uint256 offerId
    );
    event priceChanged(
        address owner,
        uint256 price,
        address tokenAddress,
        uint256 tokenId,
        uint256 offerId
    );
    event monkeyRemoved(address owner, uint256 tokenId, address tokenAddress);

    modifier onlyMonkeyOwner(address _tokenAddress, uint256 _tokenId) {
        IERC721 tokenContract = IERC721(_tokenAddress);
        require(
            tokenContract.ownerOf(_tokenId) == msg.sender,
            "Not token owner"
        );
        _;
    }

    modifier isApprovedForAll(address _tokenAddress) {
        IERC721 tokenContract = IERC721(_tokenAddress);
        require(
            tokenContract.isApprovedForAll(msg.sender, address(this)) == true,
            "Not approved to sell"
        );
        _;
    }

    modifier itemExists(uint256 _offerId) {
        require(
            _offerId < offers.length && offers[_offerId].offerId == _offerId,
            "Offer not found."
        );
        _;
    }

    modifier isForSale(uint256 _offerId) {
        require(offers[_offerId].isSold == false, "Monkey already sold.");
        _;
    }

    constructor(address payable _publisherWallet, uint256 _feeAmount) {
        setPublisherWallet(_publisherWallet);
        setPublisherFee(_feeAmount);
    }

    function setPublisherWallet(address payable _wallet) public onlyOwner {
        publisherWallet = _wallet;
    }

    // @dev set as whole number 1-100
    function setPublisherFee(uint256 _feeAmount) public onlyOwner {
        PUBLISHERFEE = _feeAmount;
    }

    function getOfferLength() public view returns (uint256) {
        return offers.length;
    }

    function isTokenActive(address tokenAddress, uint256 tokenId)
        public
        view
        returns (bool)
    {
        return activeOffers[tokenAddress][tokenId];
    }

    function getTokenOffer(address tokenAddress, uint256 tokenId)
        public
        view
        returns (Offer memory)
    {
        return tokenOffer[tokenAddress][tokenId];
    }

    function setOffer(
        uint256 price,
        uint256 tokenId,
        address tokenAddress
    )
        public
        onlyMonkeyOwner(tokenAddress, tokenId)
        isApprovedForAll(tokenAddress)
    {
        require(
            activeOffers[tokenAddress][tokenId] == false,
            "Already on sale"
        );

        uint256 newOfferId = offers.length;

        Offer memory offer = Offer(
            payable(msg.sender),
            tokenAddress,
            price,
            newOfferId,
            tokenId,
            false,
            true
        );

        tokenOffer[tokenAddress][tokenId] = offer;

        offers.push(offer);

        activeOffers[tokenAddress][tokenId] = true;

        emit monkeyAdded(
            tokenAddress,
            msg.sender,
            price,
            tokenId,
            newOfferId,
            false
        );
    }

    function removeOffer(uint256 offerId) public {
        require(
            offers[offerId].seller == msg.sender,
            "Must be the seller to remove an offer"
        );
        require(
            activeOffers[offers[offerId].tokenAddress][
                offers[offerId].tokenId
            ] == true,
            "Not for sale"
        );
        address tokenAddress = offers[offerId].tokenAddress;
        uint256 tokenId = offers[offerId].tokenId;

        delete activeOffers[offers[offerId].tokenAddress][
            offers[offerId].tokenId
        ];
        delete tokenOffer[offers[offerId].tokenAddress][
            offers[offerId].tokenId
        ];
        delete offers[offerId];

        emit monkeyRemoved(msg.sender, tokenId, tokenAddress);
    }

    function changePrice(uint256 newPrice, uint256 offerId)
        public
        isForSale(offerId)
    {
        require(offers[offerId].seller == msg.sender, "Must be seller");
        require(
            newPrice >= 1000,
            "Price must be greater than or equal to 1000 wei"
        );
        require(
            activeOffers[offers[offerId].tokenAddress][
                offers[offerId].tokenId
            ] == true,
            "Not for sale"
        );
        require(offers[offerId].isSold == false, "Item already sold");

        offers[offerId].price = newPrice;
        tokenOffer[offers[offerId].tokenAddress][offers[offerId].tokenId]
            .price = newPrice;

        emit priceChanged(
            msg.sender,
            newPrice,
            offers[offerId].tokenAddress,
            offers[offerId].tokenId,
            offers[offerId].offerId
        );
    }

    function buyMonkey(uint256 offerId)
        public
        payable
        nonReentrant
        itemExists(offerId)
        isForSale(offerId)
    {
        require(
            offers[offerId].price <= msg.value,
            "Payment must be equal to price of the monkey"
        );
        require(
            offers[offerId].seller != msg.sender,
            "Cannot buy your own monkey"
        );
        require(
            activeOffers[offers[offerId].tokenAddress][
                offers[offerId].tokenId
            ] == true,
            "Not for sale"
        );

        address tokenAddress = offers[offerId].tokenAddress;
        uint256 tokenId = offers[offerId].tokenId;
        address payable seller = offers[offerId].seller;
        uint256 price = offers[offerId].price;

        delete activeOffers[tokenAddress][tokenId];
        delete tokenOffer[tokenAddress][tokenId];
        delete offers[offerId];

        IERC721(tokenAddress).safeTransferFrom(seller, msg.sender, tokenId);

        _distributeFees(price, seller);

        emit monkeySold(tokenAddress, msg.sender, price, tokenId, offerId);
    }

    function _computePublisherFee(uint256 price)
        internal
        view
        returns (uint256)
    {
        uint256 publisherFee = (price * PUBLISHERFEE) / 100;
        return publisherFee;
    }

    function _distributeFees(uint256 soldPrice, address payable seller)
        internal
    {
        uint256 publisherFee = _computePublisherFee(soldPrice);
        uint256 payment = soldPrice - publisherFee;

        payable(seller).sendValue(payment);
        payable(publisherWallet).sendValue(publisherFee);
    }
}
