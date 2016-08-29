<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use AppBundle\Entity\Conductor;
use AppBundle\Form\ConductorType;

/**
 * Conductor controller.
 *
 * @Route("/conductor")
 */
class ConductorController extends Controller
{
    /**
     * Lists all Conductor entities.
     *
     * @Route("/", name="conductor_index")
     * @Method("GET")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $conductors = $em->getRepository('AppBundle:Conductor')->findAll();

        return $this->render('conductor/index.html.twig', array(
            'conductors' => $conductors,
        ));
    }

    /**
     * Creates a new Conductor entity.
     *
     * @Route("/new", name="conductor_new")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request)
    {
        $conductor = new Conductor();
        $form = $this->createForm('AppBundle\Form\ConductorType', $conductor);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($conductor);
            $em->flush();

            return $this->redirectToRoute('conductor_show', array('id' => $conductor->getId()));
        }

        return $this->render('conductor/new.html.twig', array(
            'conductor' => $conductor,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Conductor entity.
     *
     * @Route("/{id}", name="conductor_show")
     * @Method("GET")
     */
    public function showAction(Conductor $conductor)
    {
        $deleteForm = $this->createDeleteForm($conductor);

        return $this->render('conductor/show.html.twig', array(
            'conductor' => $conductor,
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Displays a form to edit an existing Conductor entity.
     *
     * @Route("/{id}/edit", name="conductor_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, Conductor $conductor)
    {
        $deleteForm = $this->createDeleteForm($conductor);
        $editForm = $this->createForm('AppBundle\Form\ConductorType', $conductor);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($conductor);
            $em->flush();

            return $this->redirectToRoute('conductor_edit', array('id' => $conductor->getId()));
        }

        return $this->render('conductor/edit.html.twig', array(
            'conductor' => $conductor,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Deletes a Conductor entity.
     *
     * @Route("/{id}", name="conductor_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, Conductor $conductor)
    {
        $form = $this->createDeleteForm($conductor);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($conductor);
            $em->flush();
        }

        return $this->redirectToRoute('conductor_index');
    }

    /**
     * Creates a form to delete a Conductor entity.
     *
     * @param Conductor $conductor The Conductor entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(Conductor $conductor)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('conductor_delete', array('id' => $conductor->getId())))
            ->setMethod('DELETE')
            ->getForm()
        ;
    }
}
