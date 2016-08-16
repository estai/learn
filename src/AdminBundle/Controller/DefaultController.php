<?php

namespace AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class DefaultController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {
        /** @var \Doctrine\ORM\EntityRepository $repository */
        $repository = $this->getDoctrine()->getRepository('CommonBundle:UserAdmin');
        $queryBuilder = $repository->createQueryBuilder('r');


        $grid = $this->get('pedroteixeira.grid')->createGrid('\AdminBundle\Grid\AdminUserGrid');
        $grid->setQueryBuilder($queryBuilder);

        if ($grid->isResponseAnswer()) {
            return $grid->render();
        }

        return $this->render('AdminBundle:Default:index.html.twig',array(
            'grid'   => $grid->render()
        ));
    }
}
