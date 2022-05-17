// SPDX-License-Identifier: MIT

//                                                 ______   __                                                   
//                                                /      \ /  |                                                  
//   _______   ______    ______   _______        /$$$$$$  |$$/  _______    ______   _______    _______   ______  
//  /       | /      \  /      \ /       \       $$ |_ $$/ /  |/       \  /      \ /       \  /       | /      \ 
// /$$$$$$$/ /$$$$$$  |/$$$$$$  |$$$$$$$  |      $$   |    $$ |$$$$$$$  | $$$$$$  |$$$$$$$  |/$$$$$$$/ /$$$$$$  |
// $$ |      $$ |  $$ |$$ |  $$/ $$ |  $$ |      $$$$/     $$ |$$ |  $$ | /    $$ |$$ |  $$ |$$ |      $$    $$ |
// $$ \_____ $$ \__$$ |$$ |      $$ |  $$ |      $$ |      $$ |$$ |  $$ |/$$$$$$$ |$$ |  $$ |$$ \_____ $$$$$$$$/ 
// $$       |$$    $$/ $$ |      $$ |  $$ |      $$ |      $$ |$$ |  $$ |$$    $$ |$$ |  $$ |$$       |$$       |
//  $$$$$$$/  $$$$$$/  $$/       $$/   $$/       $$/       $$/ $$/   $$/  $$$$$$$/ $$/   $$/  $$$$$$$/  $$$$$$$/
//                         .-.
//         .-""`""-.    |(@ @)
//      _/`oOoOoOoOo`\_ \ \-/
//     '.-=-=-=-=-=-=-.' \/ \
//       `-=.=-.-=.=-'    \ /\
//          ^  ^  ^       _H_ \

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MasterChefV2.sol";


/**
* @title Corn Finance Master Chef Controller
* @author C.W.B.
* @dev  1.) Deploy this contract
*       2.) Transfer ownership of MasterChef to this contract
*       3.) Transfer ownership of this contract to the timelock
*/
contract MasterChefController is Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_DEPOSIT_FEE = 300;          // 3%
    uint256 public constant MAX_EMISSION_RATE = 50 ether;   // 50 COB / block
    MasterChefV2 public constant masterChef = MasterChefV2(0xb4B14Aa0dfa22Cb3549de81E2657c6c026014090);

    function add(uint256 _allocPoint, IERC20 _lpToken, uint16 _depositFeeBP, bool _withUpdate) external onlyOwner {
        require(_depositFeeBP <= MAX_DEPOSIT_FEE, "CornFi MC Controller: Max deposit fee exceeded");
        masterChef.add(_allocPoint, _lpToken, _depositFeeBP, _withUpdate);
    }

    function set(uint256 _pid, uint256 _allocPoint, uint16 _depositFeeBP, bool _withUpdate) external onlyOwner {
        require(_depositFeeBP <= MAX_DEPOSIT_FEE, "CornFi MC Controller: Max deposit fee exceeded");
        masterChef.set(_pid, _allocPoint, _depositFeeBP, _withUpdate);
    }

    function updateEmissionRate(uint256 _cobPerBlock) external onlyOwner {
        require(_cobPerBlock <= MAX_EMISSION_RATE, "CornFi MC Controller: Max emission rate exceeded");
        masterChef.updateEmissionRate(_cobPerBlock);
    }
}
