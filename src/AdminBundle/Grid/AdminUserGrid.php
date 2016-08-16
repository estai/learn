<?php
namespace AdminBundle\Grid;


use PedroTeixeira\Bundle\GridBundle\Grid\GridAbstract;

class AdminUserGrid extends GridAbstract
{

    /**
     * Setup grid, the place to add columns and options
     */
    public function setupGrid()
    {
        $this->addColumn('ID')
            ->setField('id')
            ->setIndex('r.id')
            ->getFilter()
            ->getOperator()
            ->setComparisonType('equal');

        $this->addColumn('UserName')
            ->setField('username')
            ->setIndex('r.username');

        $this->addColumn('Action')
            ->setTwig('PedroTeixeiraTestBundle:Test:gridAction.html.twig')
            ->setFilterType(false);
    }
}