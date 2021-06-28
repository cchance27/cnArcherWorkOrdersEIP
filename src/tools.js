function isPPPoE(archer) {
    return archer.vlan == 20 || archer.package.toLowerCase().indexOf("pppoe") > 0
}

export {isPPPoE};